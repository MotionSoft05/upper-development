const undici = {
  fetch: global.fetch,
  Headers: class Headers {},
  Response: class Response {},
  Request: class Request {},
};

module.exports = undici;
module.exports.fetch = undici.fetch;
module.exports.Headers = undici.Headers;
module.exports.Response = undici.Response;
module.exports.Request = undici.Request;
