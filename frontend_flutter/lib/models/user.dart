class User {
  final int? id;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? email;
  final bool? gender;
  final String? avatar;
  final String? role;
  final bool? active;
  final String? username;
  final String? password;

  User({
    this.id,
    this.firstName,
    this.lastName,
    this.phone,
    this.email,
    this.gender,
    this.avatar,
    this.role,
    this.active,
    this.username,
    this.password,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      gender: json['gender'] as bool?,
      avatar: json['avatar'] as String?,
      role: json['role'] as String?,
      active: json['active'] as bool?,
      username: json['username'] as String?,
      password: json['password'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'email': email,
      'gender': gender,
      'avatar': avatar,
      'role': role,
      'active': active,
      'username': username,
      'password': password,
    };
  }
}