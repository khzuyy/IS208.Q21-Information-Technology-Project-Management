Link repository: https://github.com/kiengkvn2305/TICKET

Hướng dẫn cài đặt và chạy Hệ thống Quản lý và Phân phối vé sự kiện giải trí
Mô tả
	Hệ thống Quản lý và Phân phối vé sự kiện giải trí được phát triển bằng Java với giao diện HTML + CSS và sử dụng Oracle Database để lưu trữ dữ liệu. Hướng dẫn này sẽ giúp bạn cài đặt môi trường cần thiết, cấu hình cơ sở dữ liệu, chỉnh sửa thông tin kết nối database, và chạy ứng dụng.
Yêu cầu hệ thống
	Hệ điều hành: Windows, macOS, hoặc Linux.
	RAM: Tối thiểu 4GB (khuyến nghị 8GB).
	Dung lượng đĩa trống: Tối thiểu 2GB.
	Kết nối Internet: Để tải các công cụ và thư viện cần thiết.
Phần mềm cần cài đặt
	Java Development Kit (JDK) phiên bản 17.
	Apache Maven phiên bản 3.6.0 trở lên.
	Oracle Database (phiên bản 21c hoặc mới hơn, ví dụ: Oracle Database 21c Express Edition).
	IDE (khuyến nghị: IntelliJ IDEA, Eclipse, hoặc NetBeans) hoặc trình soạn thảo văn bản (như VS Code, Notepad++) để chỉnh sửa file code.
	Git (tùy chọn, để tải mã nguồn từ repository nếu có).

Các bước cài đặt
1. Cài đặt JDK 17
	Tải JDK 17 từ trang chính thức của Oracle hoặc sử dụng OpenJDK từ Adoptium.
	Cài đặt JDK theo hướng dẫn của hệ điều hành.
	Thiết lập biến môi trường JAVA_HOME:
		Windows:
			Nhấn chuột phải vào "This PC" > Properties > Advanced system settings > Environment Variables.
			Thêm biến JAVA_HOME với giá trị là đường dẫn tới thư mục cài đặt JDK (ví dụ: C:\Program Files\Java\jdk-17).
			Thêm %JAVA_HOME%\bin vào biến Path.
		Linux/macOS:
			Mở terminal và chỉnh sửa file ~/.bashrc hoặc ~/.zshrc
			Thêm dòng: export JAVA_HOME=/path/to/jdk-17 (thay /path/to/jdk-17 bằng đường dẫn thực tế).
			Thêm dòng: export PATH=$JAVA_HOME/bin:$PATH.
			Chạy source ~/.bashrc hoặc source ~/.zshrc để áp dụng.
	Kiểm tra cài đặt: Mở terminal/command prompt và chạy:
		java -version
		Đảm bảo phiên bản hiển thị là 17.x.x.
2. Cài đặt Apache Maven
	Tải Maven từ trang chính thức.
	Giải nén file tải về vào một thư mục (ví dụ: C:\apache-maven-3.9.9 hoặc /opt/maven).
	Thiết lập biến môi trường M2_HOME và cập nhật Path:
	Windows:
		Thêm biến M2_HOME với giá trị là đường dẫn tới thư mục Maven.
		Thêm %M2_HOME%\bin vào biến Path.
	Linux/macOS:
		Thêm vào ~/.bashrc hoặc ~/.zshrc:
			export M2_HOME=/path/to/maven
			export PATH=$M2_HOME/bin:$PATH
		Chạy source ~/.bashrc hoặc source ~/.zshrc.
		Kiểm tra cài đặt: Chạy:
			mvn -version
	Đảm bảo Maven được cài đặt đúng và hiển thị phiên bản.
3. Cài đặt Oracle Database
	Tải Oracle Database 21c Express Edition từ trang chính thức của Oracle.
	Cài đặt theo hướng dẫn của Oracle, ghi nhớ:
		Port: Mặc định là 1521.
		Service Name/SID: Mặc định là XE (trong ứng dụng sử dụng XEPDB1, cần kiểm tra).
		Username và Password cho tài khoản admin (sẽ cần để tạo user cho ứng dụng).
	Tạo user cho ứng dụng:
		Kết nối tới database bằng SQL*Plus hoặc một công cụ như SQL Developer với tài khoản admin.
		Chạy lệnh SQL sau để tạo user (thay your_password bằng mật khẩu mong muốn):
		CREATE USER C##Clinic_user IDENTIFIED BY your_password;
		GRANT CONNECT, RESOURCE, DBA TO C##Clinic_user;
		Kiểm tra kết nối bằng cách đăng nhập với user C##Clinic_user và mật khẩu đã tạo.
4. Cấu hình kết nối cơ sở dữ liệu
	Mở file ticket-backend/target/classes/application.properties trong thư mục dự án bằng IDE hoặc trình soạn thảo văn bản.
	Tìm các dòng sau trong file:
		spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/XEPDB1
		spring.datasource.username=TICKETDB
		spring.datasource.password=thumonvn2305
	Chỉnh sửa các giá trị để khớp với cơ sở dữ liệu Oracle của bạn:
	URL: Cập nhật host, port, và service name/SID. Ví dụ:
		spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/XEPDB1
	Thay localhost nếu database chạy trên máy khác.
	Thay 1521 bằng port của database (thường là 1521 hoặc 1525).
	Thay XEPDB1 bằng service name/SID của database (ví dụ: FREE hoặc XEPDB1).
	USER: Thay bằng username đã tạo (ví dụ: TICKETDB).
		spring.datasource.username=TICKETDB
	PASS: Thay bằng mật khẩu của user đã tạo.
		spring.datasource.password=your_password
	Lưu file sau khi chỉnh sửa.
5. Tải mã nguồn ứng dụng
	Nếu mã nguồn được lưu trên Git repository, clone về máy:
		git clone <repository_url>
	Nếu mã nguồn là thư mục cục bộ, sao chép thư mục dự án vào máy.

6. Biên dịch và chạy ứng dụng
	Mở terminal/command prompt và di chuyển vào thư mục dự án (chứa file pom.xml):
	Ví dụ: cd D:\TICKET\ticket-backend
	Biên dịch dự án: mvn clean package
	Chạy ứng dụng: mvn spring-boot:run (nếu lỗi thì .\mvnw spring-boot: run)
	Khi đó backend đã được hoạt động, nhìn vào terminal sẽ thấy dòng 
		“Tomcat started on port 8080 (http) with context path ''” 
 		“Completed initialization in x ms”
	Thì phần mềm đang chạy trên http://localhost:8080
	Để phần mềm có thể được sử dụng trên web, chúng ta tải thêm ngrok.exe để có thể deploy free trên web được, phần mềm này giúp deploy nhưng vẫn sử dụng database ở trong máy của mình, 	để deploy ta cần di chuyển tới thư mục chứa file ngrok.exe, ví dụ: cd D:\DownloadsFile
	Nhập lệnh để deploy: .\ngrok http 8080 (tùy theo port của web)
	Lúc này phần mềm đã được chạy trên web với domain nằm ở dòng Forwarding
	Nếu gặp lỗi liên quan đến Oracle Database, kiểm tra:
		Oracle Database đang chạy (dịch vụ Oracle phải active).
		User trong application.properties có quyền truy cập database.
7. Cấu hình bổ sung (nếu cần)
	Tài nguyên: Đảm bảo thư mục src/main/resources chứa các file tài nguyên để chạy được frontend một cách tốt nhất
	Tùy chỉnh Maven: Nếu cần thêm thư viện, chỉnh sửa pom.xml trong thẻ <dependencies> và chạy lại mvn clean install.
	Lưu ý
		Đảm bảo tường lửa không chặn port của Oracle Database (mặc định 1511, 1521 hoặc 1525).
		Nếu sử dụng IDE, bạn có thể mở dự án và chạy trực tiếp từ IDE thay vì dùng lệnh Maven.
		Sao lưu file application.properties và pom.xml trước khi chỉnh sửa.
		Liên hệ với nhóm phát triển nếu gặp lỗi không thể tự khắc phục.
	Hỗ trợ
		Nếu gặp vấn đề, hãy cung cấp:
			Mô tả lỗi chi tiết.
			Log output từ console.
			Cấu hình hệ thống (JDK, Maven, Oracle Database).
8. Về database
	Khi truy cập vào DB và chạy code sql đã được gửi kèm theo, hệ thống sẽ tạo sẵn cho 3 sự kiện, người sử dụng có thể vào xem những thông tin đó ở trong data của các bảng, sẽ có những thông tin của nhà tổ chức, của tài khoản, nhân viên, khách hàng,...
	Để thêm dữ liệu cho chuẩn xác, cần chú ý các trường dữ liệu của bảng để tránh thêm dữ liệu bị nhầm hoặc sót.



