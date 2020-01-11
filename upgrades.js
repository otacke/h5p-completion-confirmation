/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.CompletionConfirmation'] = (function () {
  return {
    1: {
      1: function (parameters, finished, extras) {
        if (parameters.behaviour) {
          // Add scoreReported field to behaviour settings
          if (typeof parameters.behaviour !== 'object') {
            const newBehaviour = {
              disableOnCheck: parameters.behaviour,
              scoreReported: 1
            };

            parameters.behaviour = newBehaviour;
          }
          else {
            parameters.behaviour.scoreReported = 1;
          }
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
