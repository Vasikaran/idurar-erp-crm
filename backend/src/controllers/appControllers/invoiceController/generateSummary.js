const mongoose = require('mongoose');
const geminiService = require('@/services/geminiService');

const Model = mongoose.model('Invoice');

const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Model.findOne({ _id: id, removed: false });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const allNotes = invoice.items
      .map((item) => item.notes)
      .filter((note) => note && note.trim() !== '');

    if (allNotes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No notes found in invoice items to summarize',
      });
    }

    const summaryResult = await geminiService.generateNotesSummary(allNotes);

    if (!summaryResult.success) {
      return res.status(500).json({
        success: false,
        message: summaryResult.message || 'Failed to generate summary',
        error: summaryResult.error,
      });
    }

    invoice.notesSummary = summaryResult.summary;
    invoice.summaryGeneratedAt = new Date();
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: 'Summary generated successfully',
      result: {
        summary: summaryResult.summary,
        notesCount: summaryResult.notesCount,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating summary',
      error: error.message,
    });
  }
};

module.exports = generateSummary;
