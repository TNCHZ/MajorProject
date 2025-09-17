class Book_Borrow {
  final int id;
  final String title;
  final String author;
  final int publishedDate;
  final double price;

  Book_Borrow({
    required this.id,
    required this.title,
    required this.author,
    required this.publishedDate,
    required this.price,
  });

  factory Book_Borrow.fromJson(Map<String, dynamic> json) {
    return Book_Borrow(
      id: json['id'],
      title: json['title'],
      author: json['author'],
      publishedDate: json['publishedDate'],
      price: json['price'].toDouble(),
    );
  }
}