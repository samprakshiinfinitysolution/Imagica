import Contact from "../models/Contact.js";

// ➕ Create new contact entry
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // ✅ No required validation anymore
    const newContact = await Contact.create({ name, email, subject, message });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📂 Get all contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete contact by ID
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// controllers/contactController.js


// ✅ Count all contacts
export const getContactCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching contact count", error });
  }
};
