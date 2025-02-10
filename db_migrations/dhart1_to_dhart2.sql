ALTER TABLE guser
    ADD default_org_id INT NOT NULL DEFAULT 1,
    ADD layout_id INT;

ALTER TABLE dataset ADD is_downloadable TINYINT DEFAULT 1;

ALTER TABLE layout
    ADD is_public TINYINT(1) DEFAULT 0,
    ADD CONSTRAINT idx_layout_share_id UNIQUE (share_id);

ALTER TABLE layout_members
    MODIFY COLUMN grid_width INT NOT NULL DEFAULT 4,
    MODIFY COLUMN mg_grid_width INT NOT NULL DEFAULT 12,
    ADD mg_grid_position INT NOT NULL DEFAULT 0,
    ADD start_col INT NOT NULL DEFAULT 1,
    ADD mg_start_col INT NOT NULL DEFAULT 1,
    ADD start_row INT NOT NULL DEFAULT 1,
    ADD mg_start_row INT NOT NULL DEFAULT 1,
    ADD grid_height INT NOT NULL DEFAULT 1,
    ADD mg_grid_height INT NOT NULL DEFAULT 1;

CREATE INDEX gene_sym ON gene (gene_symbol);
CREATE INDEX user_dataset ON dataset_display (user_id, dataset_id);

CREATE TABLE event (
      id                        INT PRIMARY KEY AUTO_INCREMENT,
      label                     VARCHAR(255) NOT NULL,
      max_attendees             INT NOT NULL,
      waitlist_size             INT NOT NULL DEFAULT 0,
      date_added                DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

CREATE TABLE event_registration (
      id                        INT PRIMARY KEY AUTO_INCREMENT,
      event_id                  INT NOT NULL,
      user_id                   INT NOT NULL,
      date_added                DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES guser(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE layout_displays (
       id                       INT PRIMARY KEY AUTO_INCREMENT,
       layout_id                INT NOT NULL,
       display_id               INT NOT NULL,
       grid_position            INT NOT NULL,
       start_col                INT NOT NULL DEFAULT 1,
       grid_width               INT NOT NULL DEFAULT 4,
       start_row                INT NOT NULL DEFAULT 1,
       grid_height              INT NOT NULL DEFAULT 1, -- height is number of rows spanned, whic
       math_preference          VARCHAR(50), -- options: 'raw', 'log2', 'log10'
       FOREIGN KEY (layout_id)
          REFERENCES layout(id)
          ON DELETE CASCADE,
       FOREIGN KEY (display_id)
          REFERENCES dataset_display(id)
          ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE user_history (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    entry_date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entry_category  VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    url             VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id)
     REFERENCES guser(id)
) ENGINE=InnoDB;

CREATE TABLE submission (
       id               VARCHAR(50) PRIMARY KEY,
       user_id                     INT NOT NULL,
       layout_id                   INT,
       is_finished                 TINYINT DEFAULT 0,
       is_restricted               TINYINT DEFAULT 0,
       date_added                DATETIME DEFAULT CURRENT_TIMESTAMP,
       email_updates               TINYINT DEFAULT 0,
       FOREIGN KEY (user_id) REFERENCES guser(id),
       FOREIGN KEY (layout_id) REFERENCES layout(id)
) ENGINE=INNODB;

CREATE TABLE submission_dataset (
       id                          INT PRIMARY KEY AUTO_INCREMENT,
       dataset_id                  VARCHAR(50) NOT NULL,
       nemo_identifier             VARCHAR(20) NOT NULL, /* from nemoarchive (should we do UUID here and make new one?) */
       pulled_to_vm_status         VARCHAR(20) default "pending", /*options: 'pending', 'loading', 'completed', 'canceled', 'failed',*/
       convert_metadata_status   VARCHAR(20) default "pending", /*options: 'pending', 'loading', 'completed', 'canceled', 'failed',*/
       convert_to_h5ad_status      VARCHAR(20) default "pending", /*options: 'pending', 'loading', 'completed', 'canceled', 'failed',*/
       make_tsne_status      VARCHAR(20) default "pending", /*options: 'pending', 'loading', 'completed', 'canceled', 'failed',*/
       log_message                 TEXT,
       is_restricted               TINYINT DEFAULT 0,
       FOREIGN KEY (dataset_id) REFERENCES dataset(id) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE submission_member (
       id                          INT PRIMARY KEY AUTO_INCREMENT,
       submission_id               VARCHAR(50) NOT NULL,
       submission_dataset_id       INT NOT NULL,
       FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
       FOREIGN KEY (submission_dataset_id) REFERENCES submission_dataset(id) ON DELETE CASCADE
) ENGINE=INNODB;
