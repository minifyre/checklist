output.render=function(state)
{
	const
	[add,back,blur,open]=
		['add','back','blur','open']
		.map(fn=>evt=>input[fn](state,evt)),
	lists=['index',...state.view.path]
	.map(function(listId,i,path)
	{
		const
		item=state.file.data[listId],
		selected=path[i+1],
		items=item.list
		//an empty item exists on the end after a splice call, b4 length is changed
		.filter(x=>!!x)
		.map(function(id)
		{
			const
			item=state.file.data[id],
			icon=item.list.length||'+',
			attrs={data:{icon},id,on:{}}
			//@todo id could be an issue if child can have multiple parents

			if(id===selected) attrs.data.selected=true
			if(id===state.view.edit)
			{
				attrs.contenteditable=true
				attrs.on.render=({target})=>target.focus()
				attrs.on.blur=blur
			}

			return v('li',attrs,item.text)
		})

		return v('ul',{},...items)
	})

	return [v('header',{},
			v('button',{pointerup:back},'<'),
			v('input',{placeholder:'search',type:'text'}),
			v('button',{on:{pointerup:add}},'+')
		),
		v('main',{on:{pointerup:open}},...lists)
	]
}