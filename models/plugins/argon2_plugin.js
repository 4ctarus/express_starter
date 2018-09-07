const log = require('../../utils/logger');
const argon2 = require('argon2');

module.exports = function (schema, options) {
  options = options || {argon2: {}, fields: []};

  schema.pre('save', function (next) {
    var model = this;
    let changed = [];
    let promise_arr = [];
    // Determine list of encrypted fields that have been modified
    options.fields.forEach(function(field, index){
      if (model.isModified(field)) {
          changed.push(field);
          promise_arr.push(encrypt(model[field], options.argon2));
          model[field] = undefined;
      }

      if (index == options.fields.length -1) {
        if (changed.length <= 0) {
          return next();
        }

        Promise.all(promise_arr).then(values => {
          changed.forEach((change, index) => {
            model[change] = values[index];
            
            if (index == changed.length -1) {
              return next();
            }
          });
        }).catch(err => {
          log.error(err);
          return next();
        });
      }
    });

    
    /*argon2.hash(this.password).then(hash => {
      this.password = hash;
      return next();
    }).catch(err => {
      this.password = null;
      return next();
    });*/
  });

  function encrypt(value, options) {
    return new Promise((resolve, reject) => {
      argon2.hash(value, options).then(hash => {
        resolve(hash);
      }).catch(err => {
        resolve(null);
      });
    });
  }
}