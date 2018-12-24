import silo from './node_modules/list/index.js'
import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'

const
{config,util,logic,output,input}=silo,
{curry}=util,
cache=//only used on a per-instance basis, not to be shared accross devices!
{
	themeGradients:{}
}

export default silo