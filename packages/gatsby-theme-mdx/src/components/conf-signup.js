/** @jsx jsx */
import {jsx} from 'theme-ui'
import {Label, Input, Button} from '@theme-ui/components'

export const FORM_ID = '1565257'

const Subscribe = ({formId = FORM_ID, skipDescription}) => (
  <div
    sx={{
      mt: [3, 4],
      width: ['100%', '32em']
    }}
  >
    <form
      sx={{borderColor: 'text'}}
      action={`https://app.convertkit.com/forms/${formId}/subscriptions`}
      method="post"
    >
      <h2
        sx={{
          mt: 0,
          lineHeight: 1,
          pb: skipDescription ? 4 : null,
          visibility: 'hidden',
          position: 'absolute',
          left: -9999,
          top: -8888
        }}
      >
        Sign up for MDXConf
      </h2>
      <Label htmlFor="first_name">Your first name</Label>
      <Input
        aria-label="Your first name"
        name="fields[first_name]"
        id="first_name"
        placeholder="First name"
        type="text"
      />
      <Label sx={{mt: 2}} htmlFor="email_address">
        Your email address
      </Label>
      <Input
        required
        aria-label="Your email address"
        name="email_address"
        id="email_address"
        placeholder="Email address"
        type="email"
      />
      <Button sx={{mt: 3, backgroundColor: '#794AD9'}}>Sign Up</Button>
    </form>
  </div>
)

export default Subscribe
