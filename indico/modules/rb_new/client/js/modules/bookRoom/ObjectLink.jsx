/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {Message, Placeholder, Segment, Icon} from 'semantic-ui-react';
import getLinkedObjectDataURL from 'indico-url:rooms_new.linked_object_data';
import {Translate, Param} from 'indico/react/i18n';
import {indicoAxios, handleAxiosError} from 'indico/utils/axios';
import camelizeKeys from 'indico/utils/camelize';

import './ObjectLink.module.scss';


export default class BookingEventLink extends React.PureComponent {
    static propTypes = {
        type: PropTypes.oneOf(['event', 'contrib', 'sessionBlock']).isRequired,
        id: PropTypes.number.isRequired,
    };

    state = {
        loaded: false,
        data: {},
    };

    componentDidMount() {
        const {type, id} = this.props;
        this.fetchLinkedObjectData(type, id);
    }

    async fetchLinkedObjectData(type, id) {
        let response;
        type = _.snakeCase(type);
        try {
            response = await indicoAxios.get(getLinkedObjectDataURL({type, id}));
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({
            loaded: true,
            data: camelizeKeys(response.data)
        });
    }

    renderLinkMessage(data) {
        const {type} = this.props;
        const {url, title, canAccess, eventTitle, eventUrl} = data;
        const mapping = {
            event: Translate.string('an event'),
            contrib: Translate.string('a contribution'),
            sessionBlock: Translate.string('a session block')
        };
        return !!mapping[type] && canAccess && (
            <Message icon color="teal">
                <Icon name="linkify" />
                <Message.Content>
                    <>
                        <Translate>
                            This booking will be linked to <Param name="type" wrapper={<strong />}
                                                                  value={mapping[type]} />:
                        </Translate>
                        <div styleName="object-link">
                            {type === 'event'
                                ? <a href={url}>{title}</a>
                                : <span>{title} (<a href={eventUrl}>{eventTitle}</a>)</span>
                            }
                        </div>
                    </>
                </Message.Content>
            </Message>
        );
    }

    render() {
        const {loaded, data} = this.state;
        return (
            loaded ? (
                this.renderLinkMessage(data)
            ) : (
                <Segment>
                    <Placeholder fluid>
                        <Placeholder.Header image>
                            <Placeholder.Line length="full" />
                            <Placeholder.Line length="full" />
                        </Placeholder.Header>
                    </Placeholder>
                </Segment>
            )
        );
    }
}