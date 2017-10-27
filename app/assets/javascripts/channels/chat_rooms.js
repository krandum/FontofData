$(document).on('ready page:load', function() {
	var messages, messages_to_bottom, input_field;
	messages = $('#messages');
	$('#message_body').keypress(function(event) {
		if (event.keyCode == 13 || event.which == 13) {
			$(this).closest("form").submit();
			$(this).val("");
		}
	});
	if ($('#messages').length > 0) {
		messages_to_bottom = function() {
			return messages.scrollTop(messages.prop("scrollHeight"));
		};
		messages_to_bottom();
		App.global_chat = App.cable.subscriptions.create({
			channel: "ChatRoomsChannel",
			chat_room_id: messages.data('chat-room-id')
		}, {
			connected: function() {},

			disconnected: function() {},

			received: function(data) {
				messages.append(data['message']);
				card = messages[0].lastChild.previousElementSibling;
				// var msg_arr = messages[0].children;
				// if (msg_arr.length > 100)
				// 	msg_arr.splice(0, 1);
				if (messages[0].scrollHeight - messages[0].scrollTop - card.clientHeight - 1 == messages[0].offsetHeight) {
					return messages_to_bottom();
				}
				return
			},
			send_message: function(message, chat_room_id) {
				return this.perform('send_message', {
					message: message,
					chat_room_id: chat_room_id
				});
			}
		});
		return $('#new_message').submit(function(e) {
			var $this, textarea, needs_scroll;
			$this = $(this);
			console.log(e);
			textarea = $this.find('#message_body');
			if ($.trim(textarea.val()).length > 1) {
				App.global_chat.send_message(textarea.val(), messages.data('chat-room-id'));
				textarea.val('');
				messages_to_bottom();
			}
			e.preventDefault();
			return false;
		});
	}
});
