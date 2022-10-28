/* eslint-disable operator-linebreak */
const FastFileString =
  "# ======================================================================================\n# =================================Need to replace======================================\n# ======================================================================================\nteams_url = \"\"\ncert_output_folder = \"\"\nios_app_folder_name = \"\"\napp_identifier_dev = \"\"\napp_identifier_stg = \"\"\napp_identifier_prod = \"\"\n\n# ======================================================================================\n# =================================DO NOT CHANGE========================================\n# ======================================================================================\ncert_output_folder_filepath = File.expand_path(cert_output_folder)\nxcodeprojPath = \"./ios/#{ios_app_folder_name}.xcodeproj\"\nxcworkspacePath = \"./ios/#{ios_app_folder_name}.xcworkspace\"\nlink_upload_ios = \"\"\nlink_upload_android = \"\"\ndiawi_token = \"7LaS855GzhMyf8iUB7oGjnoTkzn9ReOeFKd2CBQ2Do\"\ninstall_on_air_token = \"xWRyMuMoyDbg8YPZrXpS4vXOZuz86KdeMCEQ2Xm3\"\nENV_DEV = \"development\"\nENV_STG = \"staging\"\nENV_PROD = \"production\"\nIOS = \"ios\"\nANDROID = \"android\"\nLIMIT_FILE_SIZE_BYTES = 190000000\nB_TO_MB_CONVERSION_AMOUNT = 1048576\nG_DRIVE_FOLDER_ID = '1srwMGJa2kI0g_wZGSRPni3FRZQrHT-hw'\nG_DRIVE_KEY_FILE = 'fastlane/autobuildamela.json'\nusername = \"info@amela.vn\"\nteam_id = \"A934T35MUC\"\nfile_android_large_warning = \"\"\nfile_ios_large_warning = \"\"\n# ======================================================================================\n# =================================Helper functions=====================================\n# ======================================================================================\nlane :handle_upload_google_drive do |options|\n  if options[:file_path]\n    keyword = options[:file_path].split(\"/\")[-1]\n    if options[:platform] == IOS\n      keyword = keyword.split(\".ipa\")[0]\n    else\n      keyword = keyword.split(\"-\")[0]\n    end\n    upload_to_google_drive(\n      drive_keyfile: G_DRIVE_KEY_FILE,\n      service_account: false,\n      folder_id: G_DRIVE_FOLDER_ID,\n      upload_files: [options[:file_path]],\n      delete_alias_keyword: keyword\n    )\n    if options[:platform] == IOS\n      link_upload_ios = lane_context[SharedValues::GDRIVE_UPLOADED_FILE_URLS][0]\n    else\n      link_upload_android = lane_context[SharedValues::GDRIVE_UPLOADED_FILE_URLS][0]\n    end\n  end\nend\nlane :handle_upload_install_on_air do |options|\n  installonair(\n    token: install_on_air_token,\n    file:  options[:file_path],\n  )\n  if options[:platform] == IOS\n    link_upload_ios = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_INSTALL_ON_AIR]\n  else\n    link_upload_android = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_INSTALL_ON_AIR]\n  end\nend\nlane :handle_upload_diawi do |options|\n  diawi(\n    token: diawi_token,\n    file:  options[:file_path],\n  )\n  if options[:platform] == IOS\n    link_upload_ios = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_DIAWI]\n  else\n    link_upload_android = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_DIAWI]\n  end\nend\n# ======================================================================================\n# =================================Android==============================================\n# ======================================================================================\nlane :build_android do |options|\n  env = options[:env] || ENV_DEV\n  gradle(\n    task: \"clean\", project_dir: 'android/'\n  )\n  if env == ENV_DEV\n    gradle(\n      task: \"assemble\",\n      flavor: \"Dev\",\n      build_type: \"Release\", \n      project_dir: 'android/'\n    )\n  elsif env == ENV_STG\n    gradle(\n      task: \"assemble\",\n      flavor: \"Staging\",\n      build_type: \"Release\", \n      project_dir: 'android/'\n    )\n  else\n  end\nend\nlane :upload_android do |options|\n  env = options[:env] || ENV_DEV\n  file_path = lane_context[SharedValues::GRADLE_APK_OUTPUT_PATH]\n  file_size = File.size(file_path)\n  if file_size > LIMIT_FILE_SIZE_BYTES\n    handle_upload_google_drive(file_path: file_path, platform: ANDROID)\n    file_android_large_warning = \"File Android is too large (#{file_size / B_TO_MB_CONVERSION_AMOUNT}MB)\"\n  else\n    # handle_upload_diawi(file_path: file_path, platform: ANDROID)\n    handle_upload_install_on_air(file_path: file_path, platform: ANDROID)\n  end\n  puts \"\\n#####################\\n\"\nend\nlane :notify_ms_team_android do |options|\n  env = options[:env] || ENV_DEV\n  env_var = \"\"\n  if env == ENV_DEV\n    env_var = \"[Development]\"\n  elsif env == ENV_STG\n    env_var = \"[Staging]\"\n  elsif env == ENV_PROD\n    env_var = \"[Production]\"\n  else\n    env_var = \"[Development]\"\n  end\n  teams(\n    title: \"#{env_var} New App Version [Android] (#{ios_app_folder_name})\",\n    message: \"App's successfully released!\",\n    facts:[\n      {\n        \"name\"=>\"Latest 3 commits\",\n        \"value\"=>changelog_from_git_commits(\n          commits_count: 3,\n          pretty: \"- (%ae) %s\",\n        )\n      },\n      {\n        \"name\"=>\"Warning Android\",\n        \"value\"=>file_android_large_warning\n      },\n      {\n        \"name\"=>\"Android\",\n        \"value\"=>link_upload_android\n      }\n  ],\n  teams_url: teams_url\n    )\nend\n# ======================================================================================\n# ======================================iOS=============================================\n# ======================================================================================\nlane :build_ios do |options|\n  env = options[:env] || ENV_DEV\n  app_identifier = \"\"\n  app_scheme = \"\"\n  output_directory = \"./ios/ipa_builds_#{env}\"\n  filename_mobileprovision = \"#{ios_app_folder_name}_#{env}.mobileprovision\"\n  mobileprovision = \"#{cert_output_folder_filepath}/#{filename_mobileprovision}\"\n  code_signing_identity = \"iOS Development\"\n  if env == ENV_DEV\n    app_identifier = app_identifier_dev\n    app_scheme = \"#{ios_app_folder_name} DEV\"\n  elsif env == ENV_STG\n    app_identifier = app_identifier_stg\n    app_scheme = \"#{ios_app_folder_name} STG\"\n  else\n  end\n  get_provisioning_profile(\n    development: true,\n    force: true,\n    app_identifier: app_identifier,\n    username: username,\n    team_id: team_id,\n    filename: filename_mobileprovision,\n    output_path: cert_output_folder_filepath\n  )\n  update_code_signing_settings(\n    profile_name: \"#{app_identifier} Development\",\n    path: xcodeprojPath,\n    bundle_identifier: app_identifier,\n    team_id: team_id,\n    code_sign_identity: \"Apple Development\",\n    use_automatic_signing: false,\n  )\n  build_app(scheme: app_scheme,\n          workspace: xcworkspacePath,\n          export_method: \"development\",\n          include_bitcode: false,\n          export_options: {\n            uploadBitcode: false,\n            uploadSymbols: true,\n            compileBitcode: false,\n          },\n          clean: false,\n          output_directory: output_directory)\nend\nlane :upload_ios do |options|\n  env = options[:env] || ENV_DEV\n  output_directory = \"./ios/ipa_builds_#{env}\"\n  file_path = \"#{output_directory}/#{ios_app_folder_name}.ipa\"\n  file_size = File.size(File.join(File.dirname(File.dirname(File.absolute_path(__FILE__))), file_path))\n  handle_upload_google_drive(file_path: file_path, platform: IOS)\n  if file_size > LIMIT_FILE_SIZE_BYTES\n    file_ios_large_warning = \"File iOS is too large (#{file_size / B_TO_MB_CONVERSION_AMOUNT}MB)\"\n    handle_upload_google_drive(file_path: file_path, platform: IOS)\n  else\n    # handle_upload_diawi(file_path: file_path, platform: IOS)\n    handle_upload_install_on_air(file_path: file_path, platform: IOS)\n  end\n  puts \"\\n#####################\\n\"\nend\nlane :notify_ms_team_ios do |options|\n  env = options[:env] || ENV_DEV\n  env_var = \"\"\n  if env == ENV_DEV\n    env_var = \"[Development]\"\n  elsif env == ENV_STG\n    env_var = \"[Staging]\"\n  elsif env == ENV_PROD\n    env_var = \"[Production]\"\n  else\n    env_var = \"[Development]\"\n  end\n  teams(\n    title: \"#{env_var} New App Version [iOS] (#{ios_app_folder_name})\",\n    message: \"App's successfully released!\",\n    facts:[\n      {\n        \"name\"=>\"Latest 3 commits\",\n        \"value\"=>changelog_from_git_commits(\n          commits_count: 3,\n          pretty: \"- (%ae) %s\",\n        )\n      },\n      {\n        \"name\"=>\"Warning iOS\",\n        \"value\"=>file_ios_large_warning\n      },\n      {\n        \"name\"=>\"iOS\",\n        \"value\"=>link_upload_ios\n      },\n  ],\n  teams_url: teams_url\n  )\nend\n# ======================================================================================\n# =================================Android + iOS========================================\n# ======================================================================================\nlane :build do |options|\n  env = options[:env] || ENV_DEV\n  build_ios env:options[:env]\n  build_android env:options[:env]\nend\nlane :upload do |options|\n  env = options[:env] || ENV_DEV\n  upload_ios env:options[:env]\n  upload_android env:options[:env]\nend\nlane :notify_ms_team do |options|\n  env = options[:env] || ENV_DEV\n  env_var = \"\"\n  if env == ENV_DEV\n    env_var = \"[Development]\"\n  elsif env == ENV_STG\n    env_var = \"[Staging]\"\n  elsif env == ENV_PROD\n    env_var = \"[Production]\"\n  else\n    env_var = \"[Development]\"\n  end\n  teams(\n    title: \"#{env_var} New App Version (#{ios_app_folder_name})\",\n    message: \"App's successfully released!\",\n    facts:[\n      {\n        \"name\"=>\"Latest 3 commits\",\n        \"value\"=>changelog_from_git_commits(\n          commits_count: 3,\n          pretty: \"- (%ae) %s\",\n        )\n      },\n      {\n        \"name\"=>\"Warning iOS\",\n        \"value\"=>file_ios_large_warning\n      },\n      {\n        \"name\"=>\"iOS\",\n        \"value\"=>link_upload_ios\n      },\n      {\n        \"name\"=>\"Warning Android\",\n        \"value\"=>file_android_large_warning\n      },\n      {\n        \"name\"=>\"Android\",\n        \"value\"=>link_upload_android\n      },\n  ],\n    teams_url: teams_url\n  )\nend\n# ======================================================================================\n# =====================================Execution========================================\n# ======================================================================================\nlane :release_ios do |options|\n  build_ios env:options[:env]\n  upload_ios env:options[:env]\n  notify_ms_team_ios env:options[:env]\nend\nlane :release_android do |options|\n  build_android env:options[:env]\n  upload_android env:options[:env]\n  notify_ms_team_android env:options[:env]\nend\nlane :release do |options|\n  build env:options[:env]\n  upload env:options[:env]\n  notify_ms_team env:options[:env]\nend\nerror do |lane, exception|\n  teams(\n    title: \"⛔️ Failed to build\",\n    message: \"Your latest change is failed to build!\",\n    facts:[\n      {\n        \"name\"=>\"Error details\",\n        \"value\"=>exception\n      },\n    ],\n   teams_url: teams_url\n  )\nend";
module.exports = FastFileString;
