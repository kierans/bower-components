"use strict";

var fs = require("fs");
var Handlebars = require("handlebars");

/**
 * @type {Function}
 */
var replaceVersion;

function augmentConfig(config) {
  //noinspection JSHint
  Object.keys(config).forEach(function(key) {
    if (typeof this[key] === "object") {
      var obj = this[key];

      if (obj.all) {
        obj.local = obj.all;
        obj.cdn = obj.all;
      }
      else {
        augmentConfig(obj);
      }
    }
  }, config);
}

function checkComponent(config, component, configType) {
  if (!config[component]) {
    throw new Error("No path specified for Bower component '" + component + "'");
  }

  if (config[component][configType]) {
    return config[component][configType];
  }
  else {
    return config[component];
  }
}

function generateSafeBowerLinkTag(link) {
  return new Handlebars.SafeString("<link rel=\"stylesheet\" href=\"" + link + "\">");
}

function generateSafeLocalBowerLinkTag(config, component) {
  var cfg = checkComponent(config, component, "css");

  return generateSafeBowerLinkTag(cfg.local);
}

function generateSafeBowerScriptTag(config, component) {
  var cfg = checkComponent(config, component, "js");

  return new Handlebars.SafeString("<script src=\"" + cfg.local + "\"></script>");
}

function generateSafeCDNBowerLinkTag(config, component) {
  var cfg = checkComponent(config, component, "css");

  return generateSafeBowerLinkTag(replaceVersion(component, cfg.cdn, cfg["use-version"]));
}

function generateSafeCDNScriptTag(config, component) {
  var cfg = checkComponent(config, component, "js");

  var link = replaceVersion(component, cfg.cdn, cfg["use-version"]);

  return new Handlebars.SafeString("<script type=\"application/javascript\" src=\"" + link + "\"></script>");
}

module.exports = {
  configure: function(config) {
    augmentConfig(config);

    var DEV_ENV = "development";
    var env = process.env.NODE_ENV || DEV_ENV;
    var isProd = env !== DEV_ENV;

    config.bower = JSON.parse(fs.readFileSync(config.bower));

    replaceVersion = function(component, base, useComponentVersion) {
      component = useComponentVersion || component;

      var version = config.bower.dependencies[component].replace(/~/g, "");

      return base.replace(/\{version\}/, version);
    };

    return {
      configureHandlebarsHelpers: function(handlebarsConfig) {
        var helpers;
        handlebarsConfig.helpers = helpers = (handlebarsConfig.helpers || {});

        helpers.js = function(component) {
          if (isProd) {
            return generateSafeCDNScriptTag(config, component);
          }

          return generateSafeBowerScriptTag(config, component);
        };

        helpers.css = function(component) {
          if (isProd) {
            return generateSafeCDNBowerLinkTag(config, component);
          }

          return generateSafeLocalBowerLinkTag(config, component);
        };
      }
    };
  }
};