# ======================================================================================
# =================================Need to replace======================================
# ======================================================================================
teams_url = ""
cert_output_folder = ""
ios_app_folder_name = ""
app_identifier_dev = ""
app_identifier_stg = ""
app_identifier_prod = ""

# ======================================================================================
# =================================DO NOT CHANGE========================================
# ======================================================================================
cert_output_folder_filepath = File.expand_path(cert_output_folder)
xcodeprojPath = "./ios/#{ios_app_folder_name}.xcodeproj"
xcworkspacePath = "./ios/#{ios_app_folder_name}.xcworkspace"
link_upload_ios = ""
link_upload_android = ""
diawi_token = "7LaS855GzhMyf8iUB7oGjnoTkzn9ReOeFKd2CBQ2Do"
install_on_air_token = "xWRyMuMoyDbg8YPZrXpS4vXOZuz86KdeMCEQ2Xm3"
ENV_DEV = "development"
ENV_STG = "staging"
ENV_PROD = "production"
IOS = "ios"
ANDROID = "android"
LIMIT_FILE_SIZE_BYTES = 190000000
B_TO_MB_CONVERSION_AMOUNT = 1048576
G_DRIVE_FOLDER_ID = '1srwMGJa2kI0g_wZGSRPni3FRZQrHT-hw'
G_DRIVE_KEY_FILE = 'fastlane/autobuildamela.json'
username = "info@amela.vn"
team_id = "A934T35MUC"
file_android_large_warning = ""
file_ios_large_warning = ""
# ======================================================================================
# =================================Helper functions=====================================
# ======================================================================================
lane :handle_upload_google_drive do |options|
  upload_to_google_drive(  
    drive_keyfile: G_DRIVE_KEY_FILE,
    service_account: false,
    folder_id: G_DRIVE_FOLDER_ID,
    upload_files: [options[:file_path]]
  )
  if options[:platform] == IOS
    link_upload_ios = lane_context[SharedValues::GDRIVE_UPLOADED_FILE_URLS][0]
  else
    link_upload_android = lane_context[SharedValues::GDRIVE_UPLOADED_FILE_URLS][0]
  end
end
lane :handle_upload_install_on_air do |options|
  installonair(
    token: install_on_air_token,
    file:  options[:file_path],
  )
  if options[:platform] == IOS
    link_upload_ios = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_INSTALL_ON_AIR]
  else
    link_upload_android = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_INSTALL_ON_AIR]
  end
end
lane :handle_upload_diawi do |options|
  diawi(
    token: diawi_token,
    file:  options[:file_path],
  )
  if options[:platform] == IOS
    link_upload_ios = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_DIAWI]
  else
    link_upload_android = lane_context[SharedValues::UPLOADED_FILE_LINK_TO_DIAWI]
  end
end
# ======================================================================================
# =================================Android==============================================
# ======================================================================================
lane :build_android do |options|
  env = options[:env] || ENV_DEV
  gradle(
    task: "clean", project_dir: 'android/'
  )
  if env == ENV_DEV
    gradle(
      task: "assemble",
      flavor: "Dev",
      build_type: "Release", 
      project_dir: 'android/'
    )
  elsif env == ENV_STG
    gradle(
      task: "assemble",
      flavor: "Staging",
      build_type: "Release", 
      project_dir: 'android/'
    )
  else
  end
end
lane :upload_android do |options|
  env = options[:env] || ENV_DEV
  file_path = lane_context[SharedValues::GRADLE_APK_OUTPUT_PATH]
  file_size = File.size(file_path)
  if file_size > LIMIT_FILE_SIZE_BYTES
    handle_upload_google_drive(file_path: file_path, platform: ANDROID)
    file_android_large_warning = "File Android is too large (#{file_size / B_TO_MB_CONVERSION_AMOUNT}MB)"
  else
    # handle_upload_diawi(file_path: file_path, platform: ANDROID)
    handle_upload_install_on_air(file_path: file_path, platform: ANDROID)
  end
  puts "\n#####################\n"
end
lane :notify_ms_team_android do |options|
  env = options[:env] || ENV_DEV
  env_var = ""
  if env == ENV_DEV
    env_var = "[Development]"
  elsif env == ENV_STG
    env_var = "[Staging]"
  elsif env == ENV_PROD
    env_var = "[Production]"
  else
    env_var = "[Development]"
  end
  teams(
    title: "#{env_var} New App Version [Android] (#{ios_app_folder_name})",
    message: "App's successfully released!",
    facts:[
      {
        "name"=>"Latest 3 commits",
        "value"=>changelog_from_git_commits(
          commits_count: 3,
          pretty: "- (%ae) %s",
        )
      },
      {
        "name"=>"Warning Android",
        "value"=>file_android_large_warning
      },
      {
        "name"=>"Android",
        "value"=>link_upload_android
      }
  ],
  teams_url: teams_url
    )
end
# ======================================================================================
# ======================================iOS=============================================
# ======================================================================================
lane :build_ios do |options|
  env = options[:env] || ENV_DEV
  app_identifier = ""
  app_scheme = ""
  output_directory = "./ios/ipa_builds_#{env}"
  filename_mobileprovision = "#{ios_app_folder_name}_#{env}.mobileprovision"
  mobileprovision = "#{cert_output_folder_filepath}/#{filename_mobileprovision}"
  code_signing_identity = "iOS Development"
  if env == ENV_DEV
    app_identifier = app_identifier_dev
    app_scheme = "#{ios_app_folder_name} DEV"
  elsif env == ENV_STG
    app_identifier = app_identifier_stg
    app_scheme = "#{ios_app_folder_name} STG"
  else
  end
  get_provisioning_profile(
    development: true,
    force: true,
    app_identifier: app_identifier,
    username: username,
    team_id: team_id,
    filename: filename_mobileprovision,
    output_path: cert_output_folder_filepath
  )
  update_code_signing_settings(
    profile_name: "#{app_identifier} Development",
    path: xcodeprojPath,
    bundle_identifier: app_identifier,
    team_id: team_id,
    code_sign_identity: "Apple Development",
    use_automatic_signing: false,
  )
  build_app(scheme: app_scheme,
          workspace: xcworkspacePath,
          export_method: "development",
          include_bitcode: false,
          export_options: {
            uploadBitcode: false,
            uploadSymbols: true,
            compileBitcode: false,
          },
          clean: false,
          output_directory: output_directory)
end
lane :upload_ios do |options|
  env = options[:env] || ENV_DEV
  output_directory = "./ios/ipa_builds_#{env}"
  file_path = "#{output_directory}/#{ios_app_folder_name}.ipa"
  file_size = File.size(File.join(File.dirname(File.dirname(File.absolute_path(__FILE__))), file_path))
  if file_size > LIMIT_FILE_SIZE_BYTES
    file_ios_large_warning = "File iOS is too large (#{file_size / B_TO_MB_CONVERSION_AMOUNT}MB)"
    handle_upload_google_drive(file_path: file_path, platform: IOS)
  else
    # handle_upload_diawi(file_path: file_path, platform: IOS)
    handle_upload_install_on_air(file_path: file_path, platform: IOS)
  end
  puts "\n#####################\n"
end
lane :notify_ms_team_ios do |options|
  env = options[:env] || ENV_DEV
  env_var = ""
  if env == ENV_DEV
    env_var = "[Development]"
  elsif env == ENV_STG
    env_var = "[Staging]"
  elsif env == ENV_PROD
    env_var = "[Production]"
  else
    env_var = "[Development]"
  end
  teams(
    title: "#{env_var} New App Version [iOS] (#{ios_app_folder_name})",
    message: "App's successfully released!",
    facts:[
      {
        "name"=>"Latest 3 commits",
        "value"=>changelog_from_git_commits(
          commits_count: 3,
          pretty: "- (%ae) %s",
        )
      },
      {
        "name"=>"Warning iOS",
        "value"=>file_ios_large_warning
      },
      {
        "name"=>"iOS",
        "value"=>link_upload_ios
      },
  ],
  teams_url: teams_url
  )
end
# ======================================================================================
# =================================Android + iOS========================================
# ======================================================================================
lane :build do |options|
  env = options[:env] || ENV_DEV
  build_ios env:options[:env]
  build_android env:options[:env]
end
lane :upload do |options|
  env = options[:env] || ENV_DEV
  upload_ios env:options[:env]
  upload_android env:options[:env]
end
lane :notify_ms_team do |options|
  env = options[:env] || ENV_DEV
  env_var = ""
  if env == ENV_DEV
    env_var = "[Development]"
  elsif env == ENV_STG
    env_var = "[Staging]"
  elsif env == ENV_PROD
    env_var = "[Production]"
  else
    env_var = "[Development]"
  end
  teams(
    title: "#{env_var} New App Version (#{ios_app_folder_name})",
    message: "App's successfully released!",
    facts:[
      {
        "name"=>"Latest 3 commits",
        "value"=>changelog_from_git_commits(
          commits_count: 3,
          pretty: "- (%ae) %s",
        )
      },
      {
        "name"=>"Warning iOS",
        "value"=>file_ios_large_warning
      },
      {
        "name"=>"iOS",
        "value"=>link_upload_ios
      },
      {
        "name"=>"Warning Android",
        "value"=>file_android_large_warning
      },
      {
        "name"=>"Android",
        "value"=>link_upload_android
      },
  ],
    teams_url: teams_url
  )
end
# ======================================================================================
# =====================================Execution========================================
# ======================================================================================
lane :release_ios do |options|
  build_ios env:options[:env]
  upload_ios env:options[:env]
  notify_ms_team_ios env:options[:env]
end
lane :release_android do |options|
  build_android env:options[:env]
  upload_android env:options[:env]
  notify_ms_team_android env:options[:env]
end
lane :release do |options|
  build env:options[:env]
  upload env:options[:env]
  notify_ms_team env:options[:env]
end
error do |lane, exception|
  teams(
    title: "⛔️ Failed to build",
    message: "Your latest change is failed to build!",
    facts:[
      {
        "name"=>"Error details",
        "value"=>exception
      },
    ],
   teams_url: teams_url
  )
end