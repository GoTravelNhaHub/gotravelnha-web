// English is the source of truth: vi and zh must have the same shape (checked by `Messages`).
import common from './common'
import explore from './explore'
import planner from './planner'
import trips from './trips'
import places from './places'
import partners from './partners'
import auth from './auth'
import account from './account'
import info from './info'
import community from './community'

const en = { common, explore, planner, trips, places, partners, auth, account, info, community }

export type Messages = typeof en
export default en
