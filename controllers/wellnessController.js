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
    console.log('Raw request body:', req.body);
    console.log('Symptoms array:', req.body.symptoms); // Log symptoms array

    // Initialize symptoms object with all false values
    const symptomsMap = {
      sleep_issues: false,
      physical_discomfort: false,
      mood_swings: false,
      appetite_changes: false,
      fatigue: false,
      anxiety: false
    };

    // If symptoms array exists, update the corresponding values to true
    if (Array.isArray(req.body.symptoms)) {
      req.body.symptoms.forEach(symptom => {
        // Convert symptom string to the corresponding database field name
        const normalizedSymptom = symptom.toLowerCase().replace(' ', '_');
        if (symptomsMap.hasOwnProperty(normalizedSymptom)) {
          symptomsMap[normalizedSymptom] = true;
        }
      });
    }

    console.log('Processed symptoms map:', symptomsMap);

    const {
      user_id,
      entry_date,
      moodLevel,
      energyLevel
    } = req.body;

    // Validate required fields
    if (!user_id || !entry_date || moodLevel === undefined || energyLevel === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('wellness_entry')
      .insert([{
        user_id,
        entry_date,
        moodLevel,
        energyLevel,
        ...symptomsMap  // Spread all the symptom fields
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Create entry error:', error);
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