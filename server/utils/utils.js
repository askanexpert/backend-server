const logJSONObject = function (message, obj) {
  console.log(message);
  console.log('----------------------------------------------------------');
  console.log(JSON.stringify(obj, undefined, 2));
  console.log('----------------------------------------------------------');
}

module.exports = {logJSONObject}
