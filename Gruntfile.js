'use strict';

module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed MIT */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      sources: {
        src: ['src/cities-map.js'],
        dest: 'src/all.js'
      },
      dist: {
        src: ['src/all.js'],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      },
      tests: {
        src: ['test/cities-map.spec.js'],
        dest: 'test/all.spec.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc',
          ignores: ['test/index.spec.js']
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'mocha']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mocha']
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 9000
        }
      }
    },
    mocha: {
      index: ['test/cities-map.html']
    },
    smash: {
      sinonAll: {
        src: 'bower_components/sinon/lib/sinon.index.js',
        dest: 'bower_components/sinon/lib/sinon.all.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-smash');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'concat', 'mocha', 'concat', 'uglify']);
  grunt.registerTask('server', ['connect', 'watch']);
  grunt.registerTask('test', ['jshint', 'smash', 'connect', 'concat', 'mocha']);
};
