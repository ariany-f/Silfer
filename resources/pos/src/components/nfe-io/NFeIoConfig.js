import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Form } from 'react-bootstrap-v5';
import MasterLayout from '../MasterLayout';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import { fetchNfeConfig, updateNfeConfig } from '../../store/action/nfeIoAction';
import ModelFooter from '../../shared/components/modelFooter';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';

const NFeIoConfig = (props) => {
    const { nfeConfig, fetchNfeConfig, updateNfeConfig } = props;
    const [form, setForm] = useState({
        nfe_io_enabled: false,
        nfe_io_api_key: '',
        nfe_io_company_id: '',
        nfe_io_state_tax_id: '',
    });
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        fetchNfeConfig();
    }, []);

    useEffect(() => {
        if (nfeConfig && Object.keys(nfeConfig).length) {
            setForm({
                nfe_io_enabled: nfeConfig.nfe_io_enabled || false,
                nfe_io_api_key: '', // never show masked key; leave blank to keep current
                nfe_io_company_id: nfeConfig.nfe_io_company_id || '',
                nfe_io_state_tax_id: nfeConfig.nfe_io_state_tax_id || '',
            });
        }
    }, [nfeConfig]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'nfe_io_enabled' ? e.target.checked : value;
        setForm((prev) => ({ ...prev, [name]: val }));
        setDisabled(false);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (!payload.nfe_io_api_key) delete payload.nfe_io_api_key;
        updateNfeConfig(payload);
        setDisabled(true);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('nfe-io.config.title')} />
            <div className="card">
                <div className="card-body">
                    <p className="text-muted mb-4">
                        {getFormattedMessage('nfe-io.config.description') || 'Configure a integração com NFe.io para emissão de Notas Fiscais Eletrônicas (NF-e) a partir das vendas pagas.'}
                    </p>
                    <Form onSubmit={onSubmit}>
                        <Form.Check
                            type="switch"
                            id="nfe_io_enabled"
                            name="nfe_io_enabled"
                            label={getFormattedMessage('nfe-io.config.enabled') || 'Habilitar integração NFe.io'}
                            checked={form.nfe_io_enabled}
                            onChange={handleChange}
                            className="mb-3"
                        />
                        <Form.Group className="mb-3">
                            <Form.Label>{getFormattedMessage('nfe-io.config.api_key') || 'Chave API (Nota Fiscal)'}</Form.Label>
                            <Form.Control
                                type="password"
                                name="nfe_io_api_key"
                                placeholder="••••••••"
                                value={form.nfe_io_api_key}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                            <Form.Text className="text-muted">
                                {getFormattedMessage('nfe-io.config.api_key_help') || 'Deixe em branco para não alterar. Obtenha em app.nfe.io'}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{getFormattedMessage('nfe-io.config.company_id') || 'ID da Empresa'}</Form.Label>
                            <Form.Control
                                type="text"
                                name="nfe_io_company_id"
                                value={form.nfe_io_company_id}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{getFormattedMessage('nfe-io.config.state_tax_id') || 'ID da Inscrição Estadual'}</Form.Label>
                            <Form.Control
                                type="text"
                                name="nfe_io_state_tax_id"
                                value={form.nfe_io_state_tax_id}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <ModelFooter onEditRecord={nfeConfig} onSubmit={onSubmit} editDisabled={disabled} cancelNotShow />
                    </Form>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    nfeConfig: state.nfeIo?.config || {},
});

export default connect(mapStateToProps, { fetchNfeConfig, updateNfeConfig })(NFeIoConfig);
