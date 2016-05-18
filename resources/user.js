/**
 * @overview <i>ccm</i> component for user authentication
 * @author André Kless <andre.kless@h-brs.de> 2015-2016
 * @copyright Copyright (c) 2015-2016 Bonn-Rhein-Sieg University of Applied Sciences
 * @license The MIT License (MIT)
 */

ccm.component( {

  /*-------------------------------------------- public component members --------------------------------------------*/

  /**
   * @summary component name
   * @memberOf ccm.components.user
   * @type {ccm.name}
   */
  name: 'user',

  /**
   * @summary default instance configuration
   * @memberOf ccm.components.user
   * @type {ccm.components.user.config}
   */
  config: {

    context: true,
    html: [ ccm.load, './json/user_html.json' ],
    lang: [ ccm.instance, './components/lang.js', { store: [ ccm.store, './json/user_lang.json' ] } ],
    sign_on: 'hbrsinfkaul',
    text_login: 'lang#login',
    text_login_title: 'lang#login_title',
    text_logout: 'lang#logout',
    text_logout_title: 'lang#logout_title',
    text_username_title: 'lang#username_title'

  },

  /*-------------------------------------------- public component classes --------------------------------------------*/

  /**
   * @summary constructor for creating <i>ccm</i> instances out of this component
   * @alias ccm.components.user.User
   * @class
   */
  Instance: function () {

    /*------------------------------------- private and public instance members --------------------------------------*/

    /**
     * @summary user dataset
     * @type {ccm.components.user.dataset}
     * @private
     */
    var dataset = null;

    /**
     * @summary observers for login and logout event
     * @type {function[]}
     * @private
     */
    var observers = [];

    /**
     * @summary own context
     * @private
     */
    var self = this;

    /**
     * @summary sign-on
     * @private
     * @type {string}
     */
    var sign_on;

    /*------------------------------------------- public instance methods --------------------------------------------*/

    /**
     * @summary initialize <i>ccm</i> instance
     * @description
     * Called one-time when this <i>ccm</i> instance is created, all dependencies are solved and before dependent <i>ccm</i> instances and components are initialized.
     * This method will be removed automatically after initialization.
     * @param {function} [callback] - callback when this instance is initialized
     */
    this.init = function ( callback ) {

      // context mode? = set context to highest ccm instance for user authentication in current ccm context
      if ( self.context ) { var context = ccm.context.find( self, 'user' ); self.context = context && context.context || context; }

      // see context of user instances
//    console.log( 'user#init', self.index, self.context );

      // privatize security relevant config members
      sign_on = self.sign_on; delete self.sign_on;

      // perform callback
      if ( callback ) callback();

    };

    /**
     * @summary render content in own website area
     * @param {function} [callback] - callback when content is rendered
     */
    this.render = function ( callback ) {

      // see render call order of user instances
//    console.log( 'user#render', self.index, self.context, self.data() );

      // context mode? => delegate function call
      if ( self.context ) return self.context.render( callback );

      /**
       * website area for own content
       * @type {ccm.element}
       */
      var element = ccm.helper.element( self );

      // user is logged in? => render logout button
      if ( self.isLoggedIn() ) element.html( ccm.helper.html(

        self.html.logged_in,                         // ccm html data template 'logged_in'
        ccm.helper.val( self.data().key, 'key' ),    // username
        ccm.helper.val( self.text_username_title ),  // value for title attribute of username
        ccm.helper.val( self.text_logout ),          // caption of logout button
        clickLogout,                                 // click event of logout button
        ccm.helper.val( self.text_logout_title )     // value for title attribute of logout button

      ) );

      // user is logged out => render login button
      else element.html( ccm.helper.html(

        self.html.logged_out,                    // ccm html data template 'logged_out'
        ccm.helper.val( self.text_login ),       // caption of logout button
        clickLogin,                              // click event of logout button
        ccm.helper.val( self.text_login_title )  // value for title attribute of logout button

      ) );

      // translate own content
      if ( self.lang ) self.lang.render();

      // perform callback
      if ( callback ) callback();

      /**
       * click event for login button
       */
      function clickLogin() {

        // append loading icon
        loading();

        // login user and (re)render own content
        self.login( function () { self.render(); } );

      }

      /**
       * click event for logout button
       */
      function clickLogout() {

        // append loading icon
        loading();

        // logout user and (re)render own content
        self.logout( function () { self.render(); } );

      }

      /**
       * append ccm loading icon
       */
      function loading() {

        // append span tag
        element.append( ccm.helper.html( { tag: 'span' } ) );

        // render ccm loading icon in appended span tag
        ccm.helper.loading( element.find( '> span:last' ) );

      }

    };

    /**
     * @summary login user
     * @param {function} [callback]
     */
    this.login = function ( callback ) {

      // context mode? => delegate function call
      if ( self.context ) return self.context.login( callback );

      // user already logged out? => perform callback without logout
      if ( self.isLoggedIn() &&  callback ) return callback();

      switch ( sign_on ) {

        case 'demo':
          ccm.load( [ 'https://kaul.inf.h-brs.de/login/demo_login.php', { realm: 'hbrsinfkaul' } ], function ( response ) { success( response.user, response.token, response.user ); } );
          break;

        case 'hbrsinfkaul':
          ccm.load( [ 'https://kaul.inf.h-brs.de/login/login.php', { realm: 'hbrsinfkaul' } ], function ( response ) { success( response.user, response.token, response.name, response.email ); } );
          break;

      }

      function success( key, token, name, email ) {

        dataset = {

          key:   key,
          token: token,
          name:  name,
          email: email

        };

        // (re)render own content
        if ( ccm.helper.tagExists( self.element.find( '> #' + ccm.helper.getElementID( self ) ) ) ) self.render();

        // perform callback
        if ( callback ) callback();

        // notify observers about login event
        notify( true );

      }

    };

    /**
     * @summary logout user
     * @param {function} [callback]
     */
    this.logout = function ( callback ) {

      // context mode? => delegate function call
      if ( self.context ) return self.context.logout( callback );

      // user already logged out? => perform callback without logout
      if ( !self.isLoggedIn() ) return callback();

      switch ( sign_on ) {

        case 'demo':
          ccm.load( [ 'https://logout@kaul.inf.h-brs.de/login/demo_logout.php', { realm: 'hbrsinfkaul' } ] );
          success();
          break;

        case 'hbrsinfkaul':
          ccm.load( [ 'https://logout@kaul.inf.h-brs.de/login/logout.php', { realm: 'hbrsinfkaul' } ] );
          success();
          break;

      }

      function success() {

        dataset = null;

        // (re)render own content
        if ( ccm.helper.tagExists( self.element.find( '> #' + ccm.helper.getElementID( self ) ) ) ) self.render();

        // perform callback
        if ( callback ) callback();

        // notify observers about logout event
        notify( false );

      }

    };

    /**
     * @summary checks if user is logged in
     * @returns {boolean}
     */
    this.isLoggedIn = function () {

      // context mode? => delegate function call
      if ( self.context ) return self.context.isLoggedIn();

      return !!dataset && dataset.key;

    };

    /**
     * @summary get user dataset
     * @returns {ccm.components.user.dataset}
     */
    this.data = function () {

      // context mode? => delegate function call
      if ( self.context ) return self.context.data();

      // return user dataset
      return dataset;

    };

    /**
     * @summary add an observer for login and logout event
     * @param {function} observer - will be performed when event fires (first parameter is kind of event -> true: login, false: logout)
     */
    this.addObserver = function ( observer ) {

      // context mode? => delegate function call
      if ( self.context ) return self.context.addObserver( observer );

      // add observer
      observers.push( observer );

    };

    /*------------------------------------------- private instance methods -------------------------------------------*/

    /**
     * @summary notify observers
     * @param {boolean} event - true: login, false: logout
     * @private
     */
    function notify( event ) {

      for ( var i = 0; i < observers.length; i++ )
        observers[ i ]( event );

    }

  }

  /*------------------------------------------------ type definitions ------------------------------------------------*/

  /**
   * user dataset...
   * @summary ccm instance configuration
   * @typedef {ccm.config} ccm.components.user.config
   * @property {ccm.element} element - website area of ccm instance
   * @property {string} classes - CSS classes for website area
   * @property {ccm.style} style - CSS for website area
   * @property {ccm.instance} lang - instance for multilingualism
   * @property {ccm.key} key - user key (current user)
   * @property {string} token - security token
   * @property {string} name - full name of user (surname and last name)
   * @property {string} email - user email
   * @property {string} text_login - login button value
   * @property {string} text_login_title - login button title
   * @property {string} text_logout - logout button value
   * @property {string} text_logout_title - logout button title
   * @property {string} text_username - username title
   */

} );