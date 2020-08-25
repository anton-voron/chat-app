const socket = io();


const messageForm = document.getElementById('message-form');
const messageInput = messageForm.elements.message;
const messageFormSend = document.getElementById('send');
const geoButton = document.getElementById("send-location")
const messages = document.getElementById('messages');

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const linkTemplate = document.getElementById('location-template').innerHTML;
const sidebarTimplate = document.getElementById('sidebat-template').innerHTML;


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New meessage element
    const newMessage = messages.lastElementChild;

    // Height of the last message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Vissable height
    const visiableHeight = messages.offsetHeight;

    // Height of messages container
    const containerHeight = messages.scrollHeight;

    // How far have I scroll
    const scrollOffset = messages.scrollTop + visiableHeight;

    if (containerHeight - newMessageHeight >= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', message => {
    const html = Mustache.render(linkTemplate, {
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('HH:mm')
    })

    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTimplate, {
        room,
        users
    })

    document.getElementById('sidebar').innerHTML = html;
})

messageForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    send.disabled = true;
    socket.emit('sendMessage', messageInput.value, (result) => {
        send.disabled = false;
        messageInput.value = '';
        messageInput.focus();
        console.log(result);
    })
})

geoButton.addEventListener('click', (evt) => {
    if ("geolocation" in navigator) {
        geoButton.disabled = true;
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('sendLocation', { latitude, longitude }, (result) => {
                geoButton.disabled = false;
                console.log(result);
            });
        });
    } else {
        socket.emit('sendMessage', 'Unable to send geolocation')
    }
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})

