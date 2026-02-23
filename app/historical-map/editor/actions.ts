'use server';

import { promises as fs } from 'fs';
import path from 'path';

type LayerType = 'areas' | 'borders' | 'points';

interface OverrideData {
    periodId: string;
    layerType: LayerType;
    featureIndex: number;
    properties: Record<string, unknown>;
}

interface SaveResult {
    success: boolean;
    message?: string;
    error?: string;
    results?: Record<string, string>;
}

export async function saveDataChanges(overrides: OverrideData[]): Promise<SaveResult> {
    try {
        if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
            return {
                success: false,
                error: 'No overrides provided'
            };
        }

        // Group overrides by file
        const fileGroups = new Map<string, OverrideData[]>();
        for (const override of overrides) {
            const fileKey = `${override.periodId}:${override.layerType}`;
            if (!fileGroups.has(fileKey)) {
                fileGroups.set(fileKey, []);
            }
            fileGroups.get(fileKey)!.push(override);
        }

        // Process each file
        const results: Record<string, string> = {};
        for (const [fileKey, fileOverrides] of fileGroups) {
            const [periodId, layerType] = fileKey.split(':');

            // Determine the filename based on period and layer
            const fileName = getFileName(periodId, layerType as LayerType);
            if (!fileName) {
                results[fileKey] = `error: unknown period/layer`;
                continue;
            }

            const filePath = path.join(process.cwd(), 'public', 'data', fileName);

            try {
                // Read the existing GeoJSON file
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const geojson = JSON.parse(fileContent) as GeoJSON.FeatureCollection;

                // Apply overrides
                for (const override of fileOverrides) {
                    const feature = geojson.features[override.featureIndex];
                    if (feature) {
                        feature.properties = {
                            ...feature.properties,
                            ...override.properties,
                        };
                    }
                }

                // Write back to file with pretty formatting
                await fs.writeFile(
                    filePath,
                    JSON.stringify(geojson, null, 2),
                    'utf-8'
                );

                results[fileKey] = 'success';
            } catch (error) {
                console.error(`Error processing ${fileKey}:`, error);
                results[fileKey] = `error: ${error instanceof Error ? error.message : 'unknown error'}`;
            }
        }

        // Check if any errors occurred
        const hasErrors = Object.values(results).some(r => r.startsWith('error'));

        return {
            success: !hasErrors,
            results,
            message: hasErrors ? 'Some changes failed to save' : 'Changes saved successfully'
        };

    } catch (error) {
        console.error('Save error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save changes'
        };
    }
}

function getFileName(periodId: string, layerType: LayerType): string | null {
    // Extract year from period ID (e.g., "period_1640" -> "1640")
    const yearMatch = periodId.match(/\d{4}/);
    if (!yearMatch) return null;

    const year = yearMatch[0];
    return `${layerType}-${year}.geojson`;
}