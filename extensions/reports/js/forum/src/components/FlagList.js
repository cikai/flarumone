import Component from 'flarum/Component';
import LoadingIndicator from 'flarum/components/LoadingIndicator';
import avatar from 'flarum/helpers/avatar';
import username from 'flarum/helpers/username';
import icon from 'flarum/helpers/icon';
import humanTime from 'flarum/helpers/humanTime';

export default class FlagList extends Component {
  constructor(...args) {
    super(...args);

    /**
     * Whether or not the notifications are loading.
     *
     * @type {Boolean}
     */
    this.loading = false;
  }

  view() {
    const flags = app.cache.flags || [];

    return (
      <div className="NotificationList FlagList">
        <div className="NotificationList-header">
          <h4 className="App-titleControl App-titleControl--text">Flagged Posts</h4>
        </div>
        <div className="NotificationList-content">
          <ul className="NotificationGroup-content">
            {flags.length
              ? flags.map(flag => {
                const post = flag.post();

                return (
                  <li>
                    <a href={app.route.post(post)} className="Notification Flag" config={function(element, isInitialized) {
                      m.route.apply(this, arguments);

                      if (!isInitialized) $(element).on('click', () => app.cache.flagIndex = post);
                    }}>
                      {avatar(post.user())}
                      {icon('flag', {className: 'Notification-icon'})}
                      <span className="Notification-content">
                        {username(post.user())} in <em>{post.discussion().title()}</em>
                      </span>
                      {humanTime(flag.time())}
                      <div className="Notification-excerpt">
                        {post.contentPlain()}
                      </div>
                    </a>
                  </li>
                );
              })
              : !this.loading
                ? <div className="NotificationList-empty">{app.trans('flags.no_flags')}</div>
                : LoadingIndicator.component({className: 'LoadingIndicator--block'})}
          </ul>
        </div>
      </div>
    );
  }

  /**
   * Load flags into the application's cache if they haven't already
   * been loaded.
   */
  load() {
    if (app.cache.flags && !app.forum.attribute('unreadFlagsCount')) {
      return;
    }

    this.loading = true;
    m.redraw();

    app.store.find('flags').then(flags => {
      app.forum.pushAttributes({unreadFlagsCount: 0});
      app.cache.flags = flags.sort((a, b) => b.time() - a.time());

      this.loading = false;
      m.redraw();
    });
  }
}
