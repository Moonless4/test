import Modal from './Modal.jsx';
import Icon from './Icons.jsx';

export default function ArticleModal({ post, onClose, onMenu }) {
  if (!post) return null;

  return (
    <Modal open={Boolean(post)} onClose={onClose} className="modal--article" label={post.title}>
      <article className="article">
        <div className="article__media">
          <img src={post.image} alt={post.title} />
          <span className="article__chip">{post.category}</span>
        </div>
        <div className="article__body">
          <div className="article__meta">
            <span>
              <Icon name="calendar" size={15} />
              {post.date}
            </span>
            <span>
              <Icon name="clock" size={15} />
              {post.readTime}
            </span>
          </div>
          <h2>{post.title}</h2>
          <p className="article__lead">{post.excerpt}</p>
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="article__footer">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onClose();
                onMenu();
              }}
            >
              مشاهده منوی غذاها
              <Icon name="chevronLeft" size={18} />
            </button>
            <span className="article__share">
              <Icon name="instagram" size={18} />
              <Icon name="telegram" size={18} />
              <Icon name="whatsapp" size={18} />
            </span>
          </div>
        </div>
      </article>
    </Modal>
  );
}
