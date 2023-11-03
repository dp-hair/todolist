// Định nghĩa các biến và lấy các phần tử từ DOM
const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');
const completedTasks = document.getElementById('completed-tasks');

function requestNotificationPermission() {
  Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.error('Notification permission not granted');
    }
  });
}

// Yêu cầu quyền khi khởi động ứng dụng
requestNotificationPermission();

function checkDeadlinesAndNotify() {
  const currentTime = new Date().getTime();
  for (let li of listContainer.children) {
    const deadline = new Date(li.getAttribute('data-deadline')).getTime();
    const taskName = li.getAttribute('data-text');
    if (deadline <= currentTime) {
      sendNotification(`Hết hạn công việc: ${taskName}`);
    }
  }
}

function sendNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification(message);
  } else {
    console.error('Notification permission not granted');
  }
}

// Kiểm tra deadline mỗi phút
setInterval(checkDeadlinesAndNotify, 60000);  // 60000 milliseconds = 1 minute





// Hàm thêm task mới
function addTask() {
  const deadline = document.getElementById('deadline-input').value;
  if (inputBox.value === '') {
    alert("Bạn cần viết gì đó!");
  } else {
    createTask(inputBox.value, false, deadline);
    inputBox.value = '';
    document.getElementById('deadline-input').value = ''; // Reset giá trị deadline sau khi thêm task
  }
  saveData();
  updateTaskCount();
}

// Gán sự kiện cho từng task
function attachEventListeners(taskElement) {
  // Sự kiện khi nhấn vào nút xóa
  taskElement.querySelector('span').onclick = function() {
    taskElement.remove();
    saveData();
    updateTaskCount();
  };

  // Sự kiện khi nhấn vào task để đánh dấu hoàn thành hoặc không hoàn thành
  taskElement.onclick = function(e) {
    if (e.target.tagName !== 'SPAN') {
      taskElement.classList.toggle('checked');
      if (taskElement.classList.contains('checked')) {
        moveTaskToCompleted(taskElement);
      } else {
        moveTaskToTasks(taskElement);
      }
      saveData();
      updateTaskCount();
    }
  };
}

// Chuyển task đến danh sách đã hoàn thành
function moveTaskToCompleted(taskElement) {
  const taskCopy = taskElement.cloneNode(true);
  taskElement.remove();
  completedTasks.appendChild(taskCopy);
  attachEventListeners(taskCopy);
}

// Chuyển task về danh sách đang thực hiện
function moveTaskToTasks(taskElement) {
  const taskCopy = taskElement.cloneNode(true);
  taskElement.remove();
  listContainer.appendChild(taskCopy);
  attachEventListeners(taskCopy);
}

// Cập nhật ngày hiện tại
function updateCurrentDate() {
  const currentDateElement = document.getElementById('current-date');
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);
  currentDateElement.textContent = formattedDate;
}

// Cập nhật số lượng task
function updateTaskCount() {
  const taskCountElement = document.getElementById('task-count');
  const numberOfTasks = listContainer.children.length;
  taskCountElement.textContent = numberOfTasks;
}

// Hàm lấy dữ liệu thời tiết từ API và hiển thị
function getWeatherForHanoi() {
  const API_KEY = '8376dee3ed713121bed72235b6152fc3';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=Hanoi&units=metric&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('weather-location').textContent = 'Hà Nội';
      document.getElementById('weather-temp').textContent = `${data.main.temp}°C`;
      document.getElementById('weather-description').textContent = data.weather[0].description;
    })
    .catch(error => console.error("Lỗi khi lấy dữ liệu thời tiết Hà Nội:", error));
}

// Lưu dữ liệu vào localStorage
function saveData() {
  let tasks = [];
  let completedTasksArray = [];

  // Lưu các task không hoàn thành
  for (let li of listContainer.children) {
    tasks.push({
      text: li.getAttribute('data-text'),
      checked: li.classList.contains('checked'),
      deadline: li.getAttribute('data-deadline')
    });
  }

  // Lưu các task đã hoàn thành
  for (let li of completedTasks.children) {
    completedTasksArray.push({
      text: li.getAttribute('data-text'),
      checked: li.classList.contains('checked'),
      deadline: li.getAttribute('data-deadline')
    });
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasksArray));
}

// Tạo task mới và hiển thị trên giao diện
function createTask(text, isChecked = false, deadline = '') {
  let li = document.createElement('li');
  li.setAttribute('data-text', text); // Thêm thuộc tính để lưu trữ nội dung task
  li.setAttribute('data-deadline', deadline); // Thêm thuộc tính để lưu trữ thời hạn
  li.textContent = text + (deadline ? ` (Deadline: ${deadline})` : ''); // Hiển thị thời hạn nếu có
  let span = document.createElement('span');
  span.textContent = '\u00D7';
  li.appendChild(span);
  if (isChecked) {
    li.classList.add('checked');
    completedTasks.appendChild(li);
  } else {
    listContainer.appendChild(li);
  }
  attachEventListeners(li);
}

// Hiển thị các task khi tải trang
function showTask() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => createTask(task.text, task.checked, task.deadline));

  const savedCompletedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
  savedCompletedTasks.forEach(task => createTask(task.text, task.checked, task.deadline));
}


// Khởi tạo các thông tin khi tải trang
function initializeApp() {
  getWeatherForHanoi();
  updateCurrentDate();
  showTask();
  updateTaskCount();

  // Cập nhật ngày hiện tại mỗi giây
  setInterval(updateCurrentDate, 1000);
  // Cập nhật thời tiết mỗi giờ (3600000 milliseconds = 1 hour)
  setInterval(getWeatherForHanoi, 3600000);
  // Kiểm tra deadline mỗi phút
  setInterval(checkDeadlinesAndNotify, 1000);
}

// Gọi hàm khởi tạo khi tải trang
initializeApp();

// Khi người dùng nhập một nhiệm vụ vào input box và nhấn 'Add':
// - `addTask()` được gọi.
//   - Nếu input box trống, hiện thông báo yêu cầu nhập nội dung.
//   - Nếu không, `createTask()` được gọi để tạo task mới.
//   - `saveData()` được gọi để lưu trạng thái hiện tại của task vào localStorage.
//   - `updateTaskCount()` được gọi để cập nhật số lượng task hiện tại.

// Khi task mới được tạo:
// - `createTask()` tạo một thẻ <li> mới với nội dung là nhiệm vụ.
// - Nếu nhiệm vụ được đánh dấu là đã hoàn thành, nó sẽ được thêm vào danh sách các nhiệm vụ đã hoàn thành.
// - Mỗi task mới được thêm một nút 'x' để xóa.
// - `attachEventListeners()` được gọi để gán các sự kiện cho task mới.

// Khi người dùng nhấn vào nút 'x':
// - Task sẽ bị xóa khỏi danh sách.
// - `saveData()` được gọi để cập nhật trạng thái vào localStorage.
// - `updateTaskCount()` được gọi để cập nhật số lượng task.

// Khi người dùng nhấn vào một task (không phải nút 'x'):
// - Task sẽ chuyển sang trạng thái hoàn thành hoặc chưa hoàn thành, tùy vào trạng thái hiện tại.
// - `moveTaskToCompleted()` hoặc `moveTaskToTasks()` sẽ được gọi tương ứng.
// - `saveData()` cập nhật lại trạng thái trong localStorage.
// - `updateTaskCount()` cập nhật số lượng task.

// Khi trang web được tải:
// - `initializeApp()` được gọi.
//   - `getWeatherForHanoi()` lấy thông tin thời tiết hiện tại cho Hà Nội và cập nhật nó trên trang web.
//   - `updateCurrentDate()` cập nhật ngày hiện tại trên trang web.
//   - `showTask()` hiển thị các task từ localStorage.
//   - `updateTaskCount()` cập nhật số lượng task hiện có.
//   - `setInterval(updateCurrentDate, 1000)` cập nhật ngày hiện tại mỗi giây.
//   - `setInterval(getWeatherForHanoi, 3600000)` cập nhật thông tin thời tiết mỗi giờ.

// Lưu ý:
// - `saveData()` lưu trữ thông tin về các task trong localStorage để khi tải lại trang, thông tin không bị mất.
// - Các task và trạng thái của chúng được khôi phục khi trang được tải thông qua `showTask()`.

// Kết luận:
// Mã trên tạo một ứng dụng quản lý nhiệm vụ cơ bản, cho phép người dùng thêm, xóa, và đánh dấu các nhiệm vụ là đã hoàn thành.
// Ứng dụng cũng hiển thị thông tin thời tiết hiện tại cho Hà Nội và ngày hiện tại, với dữ liệu được lưu trữ giữa các phiên làm việc.

