module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-env')

    grunt.initConfig({
        pkgFile: 'package.json',
        clean: ['build'],
        babel: {
            options: {
                sourceMap: false,
                optional: ['runtime']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './lib',
                    src: ['**/*'],
                    dest: 'build',
                    ext: '.js'
                }]
            }
        },
        qunit: {
            all: ['test/*.spec.js']
        },
        eslint: {
            options: {
                parser: 'babel-eslint'
            },
            target: ['lib/adapter.js']
        },
        contributors: {
            options: {
                commitMessage: 'update contributors'
            }
        },
        bump: {
            options: {
                commitMessage: 'v%VERSION%',
                pushTo: 'upstream'
            }
        },
        watch: {
            dist: {
                files: './lib/**/*.js',
                tasks: ['babel:dist']
            }
        },
        env: {
            test: {
                BABEL_ENV: 'test'
            }
        }
    })

    require('load-grunt-tasks')(grunt)
    grunt.registerTask('default', [/*'eslint',*/ 'build', 'env:test', 'qunit'])
    grunt.registerTask('build', 'Build wdio-qunit-framework', function () {
        grunt.task.run([
            'clean',
            'babel'
        ])
    })
    grunt.registerTask('release', 'Bump and tag version', function (type) {
        grunt.task.run([
            'build',
            'contributors',
            'bump:' + (type || 'patch')
        ])
    })
}
