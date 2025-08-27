class Book {
  final int id;
  final String title;
  final String author;
  final String publisher;
  final String publishedDate;
  final String language;
  final String isbn10;
  final String isbn13;
  final double price;
  final bool isPrinted;
  final bool isElectronic;
  final String? image;
  final String? description;
  final DateTime createdDate;
  final DateTime updatedDate;

  Book({
    required this.id,
    required this.title,
    required this.author,
    required this.publisher,
    required this.publishedDate,
    required this.language,
    required this.isbn10,
    required this.isbn13,
    required this.price,
    required this.isPrinted,
    required this.isElectronic,
    this.image,
    this.description,
    required this.createdDate,
    required this.updatedDate,
  });

  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      id: json["id"],
      title: json["title"],
      author: json["author"],
      publisher: json["publisher"],
      publishedDate: json["publishedDate"],
      language: json["language"],
      isbn10: json["isbn10"],
      isbn13: json["isbn13"],
      price: (json["price"] ?? 0).toDouble(),
      isPrinted: json["isPrinted"] ?? false,
      isElectronic: json["isElectronic"] ?? false,
      image: json["image"],
      description: json["description"],
      createdDate: DateTime.parse(json["createdDate"]),
      updatedDate: DateTime.parse(json["updatedDate"]),
    );
  }
}
