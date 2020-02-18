pipeline {
  agent {
    node {
      label 'master'
    }

  }
  stages {
    stage('DBSetup') {
      steps {
        sh 'Execute Jar through UTP jenkins job'
      }
    }
    stage('AppFactory SpotlightServices build (Fabric)') {
      steps {
        sh '''Invoke Appfactory job through Curl command.

Post-build, a CustomHook in the Appfactory job takes care of -

1. Upload & Publish artifacts
2. Create Manifest
3. Tag the manifest
'''
      }
    }
    stage('AppFactory RetailBanking service build (Fabric)') {
      steps {
        sh 'Pick the last passed build details '
      }
    }
    stage('Test Services (Spotlight)') {
      steps {
        sh '''Test services through local UTP Jenkins job,

A customhook to take care of -

1. Upload test results with manifestID.'''
      }
    }
    stage('Client Builds') {
      parallel {
        stage(' Appfactory RetailBanking Client') {
          steps {
            sh 'Run Appfactory job through curl, also takes care running Functional Tests with TestNG framework'
          }
        }
        stage('AppFactory MobileBanking Client') {
          steps {
            sh 'Invoke Appfactory job through curl, also takes care running Functional Tests with TestNG framework'
          }
        }
      }
    }
    stage('Success') {
      steps {
        echo 'SUCCESS'
      }
    }
  }
}