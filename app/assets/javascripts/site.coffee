# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
ready = ->
	selectedNodes = []
	selectedIndex = -1
	options = [
	  document.getElementById('attack')
	  document.getElementById('give')
	  document.getElementById('switch')
	]

	call_event = (node1, node2) ->

	add_options = (elem) ->
	  options.forEach (e) ->
	    elem.parentElement.appendChild e
	    e.style.display = 'block'
	    return
	  return

	remove_options = (elem) ->
	  options.forEach (e) ->
	    elem = e.firstChild.firstChild
	    if elem.classList.contains('selected')
	      elem.classList.remove 'selected'
	    e.style.display = 'none'
	    return
	  selectedIndex = -1
	  return

	$('.node').on 'click', (e) ->
	  `var elem`
	  if e.target.className == 'node'
	    node = e.target
	    elem = node.childNodes[0]
	    if elem.classList.contains('selected')
	      elem.classList.remove 'selected'
	      index = selectedNodes.indexOf(elem)
	      selectedNodes.splice index, 1
	      remove_options elem
	    else
	      elem.className += ' selected'
	      if selectedNodes.length >= 1 and selectedIndex != -1
	        selectedNodes.push elem
	        remove_options selectedNodes[0]
	        call_event selectedNodes[0].parentElement, selectedNodes[1].parentElement, options[selectedIndex]
	        setTimeout (->
	          selectedNodes.forEach (e) ->
	            e.classList.remove 'selected'
	            return
	          selectedNodes.splice 0, selectedNodes.length
	          return
	        ), 300
	      else if selectedNodes.length >= 1
	        remove_options selectedNodes[0]
	        selectedNodes[0].classList.remove 'selected'
	        selectedNodes[0] = elem
	        add_options elem
	      else
	        selectedNodes.push elem
	        add_options elem
	  else
	    option = e.target
	    elem = option.firstChild.firstChild
	    if elem.classList.contains('selected')
	      selectedIndex = -1
	      elem.classList.remove 'selected'
	    else
	      if selectedIndex != -1
	        options[selectedIndex].firstChild.firstChild.classList.remove 'selected'
	      elem.className += ' selected'
	      selectedIndex = options.indexOf(option)
	  return
$(document).ready(ready)
$(document).on('page:load', ready)
