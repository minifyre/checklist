logic.back=state=>state.view.path.pop()
logic.complete=function(state,deselectAll=true)
{
	const
	{data}=state.file,
	ids=deselectAll===true?state.view.selected:deselectAll

	ids
	.map(id=>data[id])
	.forEach(function(item)
	{
		//@todo can this cause overflow?
			//put after parent is changed?
		logic.complete(state,item.list)
		item.complete=true
	})

	if(deselectAll) logic.deselectAll(state)
}
logic.deselectAll=state=>state.view.selected=[]
logic.edit=(state,id='')=>state.view.edit=id
logic.item=(...opts)=>util.mk({complete:false,text:'',list:[]},...opts)
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
logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
logic.open=function(state,id)
{
	const
	path=['index',...state.view.path],
	i=	path.map(id=>state.file.data[id])
			.findIndex(item=>item.list.indexOf(id)!==-1)
	//close sibling lists & add to the end
	state.view.path=[...path.slice(1,i+1),id]
}
logic.openToggle=function(state,id)
{
	const i=state.view.path.indexOf(id)
	if(i===-1) return console.error(`${id} was not open`)
	state.view.path=state.view.path.slice(0,i)
}
logic.listLowest=function({view})//retrieves the id of the youngest list
{//@todo come up with a better name
	const {length}=view.path
	return length?view.path[length-1]:'index'
}
logic.remove=function(state,id)
{
	if(!state.file.data[id]) return//item was already deleted
	
	//delete children
	state.file.data[id].list.forEach(id=>logic.remove(state,id))

	//@todo if items chan have multiple parents, this needs to be overhauled

	//delete links to item
	Object.values(state.file.data)
	.forEach(function({list})
	{
		const i=list.indexOf(id)

		if(i!==-1) list.splice(i,1)
	})

	delete state.file.data[id]
}
//@todo if child items are marked uncomplete, 
	//go through their parents & mark them uncomplete as well
logic.repeat=x=>x
logic.toggleSelect=function(state,id)
{//@todo limit selection to one list 
	//or disable delete button if items on multiple levels are selected?
	const i=state.view.selected.indexOf(id)
	i!==-1?state.view.selected.splice(i,1):state.view.selected.push(id)
}