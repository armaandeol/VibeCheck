import { supabase } from "./supabase.js";

export const database = {
  // Generic select function
  async select(table, columns = "*", filters = {}) {
    let query = supabase.from(table).select(columns);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Generic insert function
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    return { data: result, error };
  },

  // Generic update function
  async update(table, data, filters = {}) {
    let query = supabase.from(table).update(data);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result, error };
  },

  // Generic delete function
  async delete(table, filters = {}) {
    let query = supabase.from(table).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Real-time subscription
  subscribe(table, callback, event = "*") {
    return supabase
      .channel(`${table}_changes`)
      .on("postgres_changes", { event, schema: "public", table }, callback)
      .subscribe();
  },
};

export default database;
