const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};

const generic = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = { notFound, generic };
