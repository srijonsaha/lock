/* eslint-disable no-nested-ternary */

import React from 'react';
import PropTypes from 'prop-types';
import CaptchaInput from '../../ui/input/captcha_input';
import * as l from '../../core/index';
import { swap, updateEntity } from '../../store/index';
import * as captchaField from '../captcha';
import { getFieldValue, isFieldVisiblyInvalid } from '../index';
import { ThirdPartyCaptcha, isThirdPartyCaptcha } from './third_party_captcha';
import { getCaptchaConfig } from '../../connection/captcha';

export default class CaptchaPane extends React.Component {
  render() {
    const { i18n, lock, onReload, isPasswordless, isPasswordReset } = this.props;
    const lockId = l.id(lock);
    const captcha = getCaptchaConfig(lock, isPasswordless, isPasswordReset);
    const value = getFieldValue(lock, 'captcha');
    const isValid = !isFieldVisiblyInvalid(lock, 'captcha');
    const provider = captcha.get('provider');

    if (isThirdPartyCaptcha(provider)) {
      function handleChange(value) {
        swap(updateEntity, 'lock', lockId, captchaField.set, value);
      }

      function reset() {
        handleChange();
      }

      return (
        <ThirdPartyCaptcha
          provider={provider}
          sitekey={captcha.get('siteKey')}
          clientSubdomain={captcha.get('clientSubdomain')}
          onChange={handleChange}
          onExpired={reset}
          hl={l.ui.language(lock)}
          isValid={isValid}
          value={value}
        />
      );
    }

    function handleChange(e) {
      swap(updateEntity, 'lock', lockId, captchaField.set, e.target.value);
    }

    const placeholder =
      captcha.get('type') === 'code'
        ? i18n.str(`captchaCodeInputPlaceholder`)
        : i18n.str(`captchaMathInputPlaceholder`);

    // TODO: blankErrorHint is deprecated.
    // It is kept for backwards compatibility in the code for the customers overwriting
    // it with languageDictionary. It can be removed in the next major release.
    return (
      <CaptchaInput
        lockId={lockId}
        image={captcha.get('image')}
        placeholder={placeholder}
        isValid={isValid}
        onChange={handleChange}
        onReload={onReload}
        value={value}
        invalidHint={i18n.str('blankErrorHint') || i18n.str('blankCaptchaErrorHint')}
      />
    );
  }
}

CaptchaPane.propTypes = {
  i18n: PropTypes.object.isRequired,
  lock: PropTypes.object.isRequired,
  error: PropTypes.bool,
  onReload: PropTypes.func.isRequired,
  isPasswordless: PropTypes.bool,
  isPasswordReset: PropTypes.bool
};

CaptchaPane.defaultProps = {
  error: false
};
