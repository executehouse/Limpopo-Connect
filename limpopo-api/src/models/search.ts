import { query } from '../lib/db';

export interface SearchResult {
  id: string;
  type: 'business' | 'event' | 'market_item';
  title: string;
  description?: string;
  geom?: Record<string, unknown> | null;
  relevance: number;
}

export const searchAll = async (
  searchTerm: string,
  options: {
    types?: ('business' | 'event' | 'market_item')[];
    near?: { lat: number; lng: number };
    limit?: number;
    offset?: number;
  } = {}
): Promise<SearchResult[]> => {
  const { types = ['business', 'event', 'market_item'], limit = 20, offset = 0 } = options;
  const queries = [];
  const params: Array<string | number> = [searchTerm, limit, offset];
  let paramIndex = 4;

  let distanceCalculation = 'NULL';
  if (options.near) {
    distanceCalculation = `ST_Distance(geom, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326))`;
    params.push(options.near.lng, options.near.lat);
  }

  if (types.includes('business')) {
    queries.push(`
      SELECT
        id,
        'business' as type,
        name as title,
        description,
        geom,
        similarity(name, $1) as relevance,
        ${distanceCalculation} as distance
      FROM businesses
      WHERE similarity(name, $1) > 0.1 AND deleted_at IS NULL
    `);
  }

  if (types.includes('event')) {
    queries.push(`
      SELECT
        id,
        'event' as type,
        title,
        description,
        geom,
        similarity(title, $1) as relevance,
        ${distanceCalculation} as distance
      FROM events
      WHERE similarity(title, $1) > 0.1 AND deleted_at IS NULL
    `);
  }

  if (types.includes('market_item')) {
    queries.push(`
      SELECT
        id,
        'market_item' as type,
        title,
        description,
        NULL as geom,
        similarity(title, $1) as relevance,
        NULL as distance
      FROM market_items
      WHERE similarity(title, $1) > 0.1 AND deleted_at IS NULL
    `);
  }

  if (queries.length === 0) {
    return [];
  }

  const fullQuery = `
    SELECT * FROM (${queries.join(' UNION ALL ')}) as results
    ORDER BY
      relevance DESC,
      CASE WHEN distance IS NOT NULL THEN distance ELSE 1e9 END ASC
    LIMIT $2
    OFFSET $3
  `;

  const { rows } = await query(fullQuery, params);
  return rows;
};