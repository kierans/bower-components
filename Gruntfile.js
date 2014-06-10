"use strict";

module.exports = function(grunt) {
  // Load grunt tasks automatically
  require("load-grunt-tasks")(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish")
      },
      gruntfile: {
        src: "Gruntfile.js"
      },
      src: {
        src: [ "*.js" ]
      }
    }
  });

  grunt.registerTask("lint", [ "jshint" ]);

  grunt.registerTask("build", [ "lint" ]);
};
