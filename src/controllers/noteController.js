const Note = require('../models/Note');

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ owner: req.user.userId });
    res.status(200).json({ data: notes });
  } catch (err) {
    next(err);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ data: note });
  } catch (err) {
    next(err);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    console.log(req.user._id);
    const note = await Note.create({ title, content, owner: req.user._id });
    res.status(201).json({ message: 'Note created successfully', data: note });
  } catch (err) {
    next(err);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, content },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note updated successfully', data: note });
  } catch (err) {
    next(err);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully', data: note });
  } catch (err) {
    next(err);
  }
};

const shareNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    const { userId } = req.body;
    if (userId === String(note.owner)) {
      return res.status(400).json({ message: 'You cannot share the note with yourself' });
    }
    if (note.sharedWith.includes(userId)) {
      return res.status(400).json({ message: 'Note already shared with this user' });
    }
    note.sharedWith.push(userId);
    await note.save();
    res.status(200).json({ message: 'Note shared successfully', data: note });
  } catch (err) {
    next(err);
  }
};

const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;
    const notes = await Note.find({
      $and: [
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
          ],
        },
        {
          $or: [
            { owner: req.user._id }, // Note owner is the authenticated user
            { sharedWith: { $in: [req.user._id] } }, // Note is shared with the authenticated user
          ],
        },
      ]
    });
    res.status(200).json({ data: notes });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote, shareNote, searchNotes };
