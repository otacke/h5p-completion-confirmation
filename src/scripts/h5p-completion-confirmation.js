import Util from './h5p-completion-confirmation-util';

export default class CompletionConfirmation extends H5P.EventDispatcher {
  /**
   * @constructor
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, contentData = {}) {
    super();

    // Sanitize params
    this.params = Util.extend({
      behaviour: {
        disableOnCheck: false,
        scoreReported: 1
      },
      l10n: 'I have completed the content.'
    }, params);

    this.contentId = contentId;
    this.contentData = contentData;
    this.previousState = this.contentData.previousState || {};

    this.container = document.createElement('div');
    this.container.classList.add('h5p-completion-confirmation-container');

    // Description box
    if (params.description) {
      const boxDescription = document.createElement('div');
      boxDescription.classList.add('h5p-completion-confirmation-box-description');
      boxDescription.innerHTML = params.description;
      this.container.appendChild(boxDescription);
    }

    // Checkbox
    this.checkbox = document.createElement('input');
    this.checkbox.classList.add('h5p-completion-confirmation-checkbox');
    if (this.previousState.checked === true) {
      this.checkbox.setAttribute('checked', true);
    }
    if (this.previousState.disabled === true) {
      this.checkbox.setAttribute('disabled', true);
    }
    this.checkbox.setAttribute('id', `h5p-completion-confirmation-${contentId}`);
    this.checkbox.setAttribute('type', 'checkbox');
    this.checkbox.addEventListener('click', () => {
      if (this.params.behaviour.disableOnCheck === true && this.isChecked()) {
        this.checkbox.setAttribute('disabled', true);
      }
      this.triggerXAPI();
    });

    // Checkbox label
    const label = document.createElement('label');
    label.classList.add('h5p-completion-confirmation-checkbox-label');
    label.setAttribute('for', `h5p-completion-confirmation-${contentId}`);
    label.innerHTML = this.params.l10n;

    this.container.appendChild(this.checkbox);
    this.container.appendChild(label);

    /**
     * Attach library to wrapper.
     * @param {jQuery} $wrapper Content's container.
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-completion-confirmation');
      $wrapper.get(0).appendChild(this.container);
    };

    /**
     * Detect whether checkbox is checked.
     * @return {boolean} True, if checkbox is checked.
     */
    this.isChecked = () => {
      return this.checkbox.checked;
    };

    /**
     * Detect whether checkbox is checked.
     * @return {boolean} True, if checkbox is checked.
     */
    this.isDisabled = () => {
      return this.checkbox.disabled;
    };

    /**
     * Trigger all necessary xAPI events after evaluation. Might become more.
     */
    this.triggerXAPI = () => {
      this.trigger(this.getXAPIResultEvent('answered'));  // Trigger activity completion in moodle plugin
      this.trigger(this.getXAPIResultEvent('completed')); // Trigger getCurrentState in H5P core
    };

    /**
     * Build xAPI event with results.
     * @param {string} [verb='answered'] Verb for xAPI statement.
     * @return {H5P.XAPIEvent} XAPI event with results.
     */
    this.getXAPIResultEvent = (verb = 'answered') => {
      const xAPIEvent = this.createXAPIEvent(verb);
      const isChecked = this.isChecked();
      xAPIEvent.setScoredResult( (isChecked) ? this.params.behaviour.scoreReported : 0, this.params.behaviour.scoreReported, this, isChecked, isChecked);
      xAPIEvent.data.statement.result.response = this.params.l10n;
      return xAPIEvent;
    };

    /**
     * Create an xAPI event.
     * @param {string} verb Short id of the verb we want to trigger.
     * @return {H5P.XAPIEvent} Event template.
     */
    this.createXAPIEvent = (verb) => {
      const xAPIEvent = this.createXAPIEventTemplate(verb);
      Util.extend(
        xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
        this.getxAPIDefinition());
      return xAPIEvent;
    };

    /**
     * Get the xAPI definition for the xAPI object.
     * @return {object} XAPI definition.
     */
    this.getxAPIDefinition = () => {
      const definition = {};
      definition.name = {'en-US': this.getTitle()};
      definition.description = {'en-US': this.getDescription() };
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'true-false';

      return definition;
    };

    /**
     * Get current state.
     * @return {Object} Current state.
     */
    this.getCurrentState = () => {
      return {
        checked: this.isChecked(),
        disabled: this.isDisabled()
      };
    };

    /**
     * Get tasks title.
     * @return {string} Title.
     */
    this.getTitle = () => {
      let raw;
      if (this.contentData && this.contentData.metadata) {
        raw = this.contentData.metadata.title;
      }
      raw = raw || CompletionConfirmation.DEFAULT_DESCRIPTION;

      return H5P.createTitle(raw);
    };

    /**
     * Get tasks description.
     * @return {string} Description.
     */
    this.getDescription = () => this.params.description || CompletionConfirmation.DEFAULT_DESCRIPTION;
  }
}

/** @constant {string} */
CompletionConfirmation.DEFAULT_DESCRIPTION = 'Completion Confirmation';
