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
        sh 'Invoke through Curl command.'
        echo 'CustomHook to upload Artifacts & Manifest'
      }
    }
    stage('AppFactory RetailBanking service build (Fabric)') {
      steps {
        sh 'Pick the last passed build details'
      }
    }
    stage('Test Services (Spotlight)') {
      steps {
        sh 'Test services through local UTP Jenkins job'
      }
    }
    stage(' Appfactory RetailBanking Client') {
      steps {
        sh 'Run Appfactory job through curl'
      }
    }
    stage('FunctionalTests on RB') {
      steps {
        sh 'Run Functional Tests through UTP jenkins job'
      }
    }
    stage('AppFactory MB build') {
      steps {
        sh 'Invoke Appfactory job through curl'
      }
    }
    stage('Functional tests on MB') {
      steps {
        sh 'Run FunctionTests through UTP Jenkins job'
      }
    }
  }
}