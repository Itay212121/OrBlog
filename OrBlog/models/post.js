const db = require("../db.js");

class Post {
    constructor(id, title, body, desc, createdAt, hidden){
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.body = body;
        this.createdAt = createdAt;
        this.hidden = hidden;
    }

    async save(){
        let sql_query = `
        INSERT INTO posts
        VALUES("${this.id}","${this.title}","${this.body}","${this.desc}","${this.createdAt}",${this.hidden});
        `;

        const [newPost, _] = await db.execute(sql_query);
        return newPost;
    }

    static async getAllPosts(){
        let [all_posts, _] =  await db.execute("SELECT * FROM posts;");
        return all_posts;
    }
    static async getPostById(id){
        let [found_posts, _] = await db.execute(`SELECT * FROM posts WHERE id= "${id}";` );
        if(found_posts.length == 0) return null;
        return found_posts[0];
    }
    static async updatePost(id, new_post){
        let sql_query = `
        UPDATE posts
        SET title= "${new_post.title}", description= "${new_post.desc}", body= "${new_post.body}", hidden= ${new_post.hidden}
        WHERE id = "${id}";
        `
        await db.execute(sql_query);
        return  
    }
}

module.exports = Post;