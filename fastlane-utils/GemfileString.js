const GemFileString = "# Autogenerated by fastlane\n#\n# Ensure this file is checked in to source control!\n\nsource \"https://rubygems.org\"\n\ngem 'fastlane'\n\nplugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')\neval_gemfile(plugins_path) if File.exist?(plugins_path)";

module.exports = GemFileString;