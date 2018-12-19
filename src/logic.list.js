//@todo may need a guard to make sure 'index' is alway the first item in path
logic.back=function(state)
{
	const
	mode=logic.mode(state),
	path=logic.path(state)

	if(mode==='path'&&path.length===1) return

	logic.path(state).pop()
}
logic.deselectAll=state=>state.view.selected=[]
logic.edit=(state,id='')=>state.view.edit=id
logic.item=(...opts)=>util.mk(util.clone(config.item),...opts)
logic.itemAdd=function(state,item,parentId='index',at=-1)
{
	const {id}=item,
	siblings=state.file.data[parentId].list

	state.file.data[id]=item
	siblings.splice(at>-1?at:siblings.length,0,id)
	logic.edit(state,id)
}
logic.itemUpdate=function(state,id,opts)//@todo have a text specifc fn?
{
	delete opts.id//don't allow changes to id
	Object.assign(state.file.data[id],opts)
}
//@todo come up with a better name
//retrieves the id of the youngest list
logic.listLowest=state=>logic.path(state).slice(-1)[0]
//@todo change path to view?
logic.mode=state=>state.view.move.filter(x=>!!x).length?'move':'path'
logic.move=state=>state.view.move=['index']
logic.moveItems=function(state,parentId,children)
{
	children.forEach(util.curry(logic.unlink,state))
	state.file.data[parentId].list.push(...children)
}
logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
logic.open=function(state,id)
{
	let
	path=logic.path(state),
	i=	path.map(id=>state.file.data[id])
		.findIndex(item=>item.list.includes(id)),
	mode=logic.mode(state)
	//close sibling lists & add to the end
	state.view[mode]=[...path.slice(0,i+1),id]
}
logic.openToggle=function(state,id)
{
	let
	path=logic.path(state),
	i=path.indexOf(id),
	mode=logic.mode(state)

	if(i===-1) return console.error(`${id} was not open`)
	state.view[mode]=path.slice(0,i)
}
logic.parent=function(state,childId)
{//@todo multiple parents will make this harder
	return Object.entries(state.file.data)
	.find(([_,{list}])=>list.includes(childId))[0]
}
logic.path=state=>state.view[logic.mode(state)]
logic.remove=function(state,id)
{
	if(!state.file.data[id]) return//item was already deleted
	
	//delete children
	state.file.data[id].list.forEach(id=>logic.remove(state,id))

	//@todo if items chan have multiple parents, this needs to be overhauled

	//delete links to item
	logic.unlink(state,id)

	delete state.file.data[id]
}
logic.unlink=function(state,id)
{
	Object.values(state.file.data)
	.forEach(function({list})
	{
		const i=list.indexOf(id)

		if(i!==-1) list.splice(i,1)
	})
}
logic.shuffle=(state,id=logic.listLowest(state))=>util.shuffle(state.file.data[id].list)
logic.toggleSelect=function(state,id)
{//@todo limit selection to one list 
	//or disable delete button if items on multiple levels are selected?
	const i=state.view.selected.indexOf(id)
	i!==-1?state.view.selected.splice(i,1):state.view.selected.push(id)
}