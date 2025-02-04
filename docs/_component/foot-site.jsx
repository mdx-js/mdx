import React from 'react'
import {config} from '../_config.js'

export function FootSite() {
  return (
    <footer className="foot-site">
      <div className="content">
        <div
          className="block"
          style={{display: 'flex', justifyContent: 'space-between'}}
        >
          <div>
            <small>
              MDX is made with ❤️ in Amsterdam, Boise, and around the 🌏
            </small>
            <br />
            <small>This site does not track you.</small>
            <br />
            <small>MIT © 2017-{new Date().getFullYear()}</small>
          </div>
          <div style={{marginLeft: 'auto', textAlign: 'right'}}>
            <small>
              Project on <a href={config.gh.href}>GitHub</a>
            </small>
            <br />
            <small>
              Site on <a href={new URL('docs/', config.ghTree).href}>GitHub</a>
            </small>
            <br />
            <small>
              Updates as <a href="/rss.xml">RSS feed</a>
            </small>
            <br />
            <small>
              Sponsor on <a href={config.oc.href}>OpenCollective</a>
            </small>
          </div>
        </div>
      </div>
    </footer>
  )
}
