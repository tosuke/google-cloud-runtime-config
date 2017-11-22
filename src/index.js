import * as google from 'googleapis'
const runtimeConfig = google.runtimeconfig('v1beta1')

class RuntimeConfig {
  constructor (options) {
    const defaults = {
      projectId: process.env.GCLOUD_PROJECT
    }
    Object.assign(this, { ...defaults, ...options })
  }

  getConfig (name) {
    let config = {}
    return auth().then(auth => {
      const parent = `projects/${this.projectId}/configs/${name}`
      return getVariablesList(auth, parent)
        .then(list =>
          Promise.all(
            list.map(name =>
              getVariable(auth, name).then(text => {
                const n = /\/([^\/]*)$/.exec(name)[1]
                config[n] = text
              })
            )
          )
        )
        .then(() => config)
    })
  }
}

function auth () {
  return new Promise((res, rej) => {
    google.auth.getApplicationDefault((err, client) => {
      if (err) {
        rej(err)
      } else {
        if (client.createScopedRequired && client.createScopedRequired()) {
          const scopes = ['https://www.googleapis.com/auth/cloud-platform']
          client = client.createScoped(scopes)
        }
        res(client)
      }
    })
  })
}

function getVariablesList (auth, parent) {
  return new Promise((res, rej) => {
    runtimeConfig.projects.configs.variables.list(
      { auth, parent },
      (err, list) => {
        if (err) {
          rej(err)
        } else {
          res(list.variables.map(a => a.name))
        }
      }
    )
  })
}

function getVariable (auth, name) {
  return new Promise((res, rej) => {
    runtimeConfig.projects.configs.variables.get(
      {
        auth,
        name
      },
      (err, data) => {
        if (err) {
          rej(err)
        } else {
          if (typeof data.text !== 'undefined') {
            res(data.text)
          } else if (typeof data.value !== 'undefined') {
            res(Buffer.from(data.value, 'base64').toString())
          } else {
            rej(new Error('Property text or value not defined'))
          }
        }
      }
    )
  })
}

export default function (options) {
  return new RuntimeConfig(options)
}
