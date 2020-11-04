'use strict';

module.exports = {
  name: require('./package').name,
  included: function() {
    this._super.included.apply(this, arguments);
  }
};
