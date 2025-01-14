const supabase = require('../controllers/supabase');

// Get all wellness entries with optional user_id filter
const getAllEntries = async (req, res) => {
  try {
    let query = supabase.from('wellness_entries').select('*');
    
    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific wellness entry by ID
// Get a specific wellness entry by ID
const getEntryById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('id', req.params.id);

    // Log the query result for debugging
    console.log("Query Result:", data);

    if (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({ error: error.message });
    }

    // Check if data is empty
    if (data.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // If there are multiple entries, log and handle it
    if (data.length > 1) {
      console.error('Multiple entries found for the same ID:', data);
      return res.status(500).json({ error: 'Multiple entries found for the same ID' });
    }

    // If there is exactly one entry, return it
    res.json(data[0]);
  } catch (error) {
    console.error('Error in getEntryById:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


// Create a new wellness entry
const createEntry = async (req, res) => {
  try {
    const {
      user_id,
      entry_date,
      feeling_level,
      energy_level,
      fatigue,
      anxiety,
      sleep_issues,
      physical_discomfort,
      mood_swings,
      appetite_changes
    } = req.body;

    // Validate required fields
    if (!user_id || !entry_date || feeling_level === undefined || energy_level === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('wellness_entries')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing wellness entry
const updateEntry = async (req, res) => {
  try {
    const { data: existingEntry } = await supabase
      .from('wellness_entries')
      .select()
      .eq('id', req.params.id)
      .single();

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const { data, error } = await supabase
      .from('wellness_entries')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a wellness entry
const deleteEntry = async (req, res) => {
  try {
    const { data: existingEntry } = await supabase
      .from('wellness_entries')
      .select()
      .eq('id', req.params.id)
      .single();

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const { error } = await supabase
      .from('wellness_entries')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry
};