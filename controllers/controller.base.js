const mongoose = require('mongoose');
const log = require('../utils/logger');

exports.list = (req, res, next, model, select = '') => {
  const query = req.query || {};
  model.apiQuery(query)
    .select(select)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.get = (req, res, next, model, select = '') => {
  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      msg: 'invalid_id'
    });
  }

  model.findById(req.params.id, select)
    .then(result => {
      if (!result) {
        return res.status(404).json({
          msg: 'id_not_found'
        });
      }
      res.json(result);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.post = (req, res, next, model) => {
  let data = req.body || {};
  delete data.createdAt;
  delete data.updatedAt;

  model.create(
      data
    )
    .then(result => {
      result.createdAt = undefined;
      result.updatedAt = undefined;
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.put = (req, res, next, model, options = {}) => {
  const data = req.body || {};
  delete data.createdAt;
  delete data.updatedAt;;
  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      msg: 'invalid_id'
    });
  }

  model.findByIdAndUpdate({
        _id: req.params.id
      },
      data, Object.assign({
        new: true,
        runValidators: true
      }, options))
    .then(result => {
      if (!result) {
        return res.status(404).json({
          msg: 'id_not_found'
        });
      }
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.delete = (req, res, next, model) => {
  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      msg: 'id_invalid'
    });
  }

  model.deleteOne({
      _id: req.params.id
    })
    .then(err => {
      if (err) {
        return res.status(404).json({
          msg: 'id_not_found'
        });
      }

      res.status(204).json({});
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};