import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Badge } from 'react-bootstrap-v5';
import MasterLayout from '../MasterLayout';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, placeholderText, currencySymbolHandling } from '../../shared/sharedMethod';
import { fetchNfeInvoices, syncSaleInvoiceStatus } from '../../store/action/nfeIoAction';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';

const statusLabels = {
    pending: 'Pendente',
    processing: 'Processando',
    authorized: 'Autorizada',
    error: 'Erro',
    cancelled: 'Cancelada',
};

const SaleInvoices = (props) => {
    const { invoices, fetchNfeInvoices, syncSaleInvoiceStatus, frontSetting, allConfigData } = props;
    const [page, setPage] = useState(1);
    const [syncingId, setSyncingId] = useState(null);

    const list = invoices?.data || [];
    const total = invoices?.total || 0;
    const perPage = invoices?.per_page || 15;
    const totalPages = Math.ceil(total / perPage) || 1;

    useEffect(() => {
        fetchNfeInvoices(page);
    }, [page]);

    const handleSync = (id) => {
        setSyncingId(id);
        syncSaleInvoiceStatus(id).finally(() => setSyncingId(null));
    };

    const currencySymbol = frontSetting?.value?.currency_symbol;

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('nfe-io.invoices.title')} />
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>{getFormattedMessage('globally.detail.reference')}</th>
                                    <th>{getFormattedMessage('customer.title')}</th>
                                    <th>{getFormattedMessage('react-data-table.date.column.label')}</th>
                                    <th>{getFormattedMessage('globally.detail.grand.total')}</th>
                                    <th>{getFormattedMessage('nfe-io.invoices.status') || 'Status'}</th>
                                    <th>{getFormattedMessage('nfe-io.invoices.number') || 'Número'}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted py-4">
                                            {getFormattedMessage('globally.no_record_found') || 'Nenhuma nota fiscal encontrada.'}
                                        </td>
                                    </tr>
                                )}
                                {list.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>{inv.reference_code}</td>
                                        <td>{inv.customer_name}</td>
                                        <td>{inv.date}</td>
                                        <td>{currencySymbolHandling(allConfigData, currencySymbol, inv.grand_total)}</td>
                                        <td>
                                            <Badge bg={
                                                inv.status === 'authorized' ? 'success' :
                                                inv.status === 'error' ? 'danger' :
                                                inv.status === 'processing' ? 'primary' : 'secondary'
                                            }>
                                                {statusLabels[inv.status] || inv.status}
                                            </Badge>
                                            {inv.error_message && (
                                                <small className="d-block text-danger mt-1">{inv.error_message}</small>
                                            )}
                                        </td>
                                        <td>{inv.invoice_number || '-'}</td>
                                        <td>
                                            {inv.status !== 'authorized' && inv.nfe_io_id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    disabled={syncingId === inv.id}
                                                    onClick={() => handleSync(inv.id)}
                                                >
                                                    {syncingId === inv.id ? '...' : (getFormattedMessage('nfe-io.invoices.sync') || 'Atualizar')}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted">
                                {getFormattedMessage('react-data-table.showing') || 'Exibindo'} {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} {getFormattedMessage('react-data-table.of') || 'de'} {total}
                            </span>
                            <div>
                                <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    ←
                                </Button>
                                <span className="mx-2">{page} / {totalPages}</span>
                                <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                    →
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    invoices: state.nfeIo?.invoices || { data: [], total: 0, per_page: 15 },
    frontSetting: state.frontSetting,
    allConfigData: state.allConfigData,
});

export default connect(mapStateToProps, { fetchNfeInvoices, syncSaleInvoiceStatus })(SaleInvoices);
