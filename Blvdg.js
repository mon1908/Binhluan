// Chọn các phần tử cần thiết
const stars = document.querySelectorAll('.star');
const nameInput = document.getElementById('name');
const commentInput = document.getElementById('comment');
const submitButton = document.getElementById('submit');
const commentList = document.getElementById('comment-list');
const totalComments = document.getElementById('total-comments');
const averageRating = document.getElementById('average-rating');

let selectedRating = 0;
let ratings = []; // Lưu trữ các đánh giá

// Hàm cập nhật tổng số bình luận và đánh giá trung bình
function updateSummary() {
    totalComments.textContent = ratings.length;
    const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length || 0;
    averageRating.textContent = average.toFixed(1); // Làm tròn 1 chữ số thập phân
}

// Hàm hiển thị các bình luận đã lưu trong localStorage
function loadComments() {
    const storedComments = JSON.parse(localStorage.getItem('comments')) || [];
    ratings = storedComments.map(comment => comment.rating); // Cập nhật danh sách đánh giá

    storedComments.forEach(comment => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="comment-name">${comment.name}</div>
            <div class="comment-text">${comment.comment}</div>
            <div class="comment-stars">${'★'.repeat(comment.rating)}</div>
        `;
        commentList.appendChild(li);
    });

    updateSummary(); // Cập nhật thống kê
}

// Xử lý sự kiện click vào sao
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = star.getAttribute('data-value'); // Lấy giá trị sao
        updateStars(selectedRating); // Cập nhật giao diện
    });
});

// Hàm cập nhật giao diện sao
function updateStars(rating) {
    stars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Xử lý khi nhấn nút gửi
submitButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();

    // Kiểm tra dữ liệu đầu vào
    if (!name || !comment || selectedRating === 0) {
        alert('Vui lòng nhập đủ thông tin và chọn số sao!');
        return;
    }

    // Tạo đối tượng bình luận
    const newComment = {
        name: name,
        comment: comment,
        rating: parseInt(selectedRating)
    };

    // Gửi bình luận tới server (nếu cần)
    try {
        const response = await fetch('/submit-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newComment)
        });

        const result = await response.json();

        if (response.ok) {
            // Thêm bình luận vào danh sách
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="comment-name">${name}</div>
                <div class="comment-text">${comment}</div>
                <div class="comment-stars">${'★'.repeat(selectedRating)}</div>
            `;
            commentList.appendChild(li);

            // Lưu bình luận vào localStorage
            const storedComments = JSON.parse(localStorage.getItem('comments')) || [];
            storedComments.push(newComment);
            localStorage.setItem('comments', JSON.stringify(storedComments));

            // Cập nhật thống kê
            ratings.push(parseInt(selectedRating)); // Lưu đánh giá vào danh sách local
            updateSummary();

            // Xóa dữ liệu trong form
            nameInput.value = '';
            commentInput.value = '';
            selectedRating = 0;
            updateStars(selectedRating); // Reset sao
        } else {
            alert('Đã có lỗi xảy ra khi gửi bình luận');
        }
    } catch (error) {
        console.error('Lỗi khi gửi bình luận:', error);
        alert('Không thể gửi bình luận. Vui lòng thử lại!');
    }
});

// Tải các bình luận từ localStorage khi trang được tải lại
window.addEventListener('load', loadComments);
   