import { Helmet } from 'react-helmet-async';
import { Formik } from 'formik';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { BrandListHead, BrandListToolbar } from '../sections/@dashboard/brand';
import { addBrand, getBrand, deleteBrand, updateBrand } from '../services/brand';
import { error, success } from 'src/utils/toast';
// mock
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Id', alignRight: false },
  { id: 'name', label: 'Brand', alignRight: false },
  { id: 'created_at', label: 'Created At', alignRight: false },
  { id: 'updated_at', label: 'Updated At', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_brand) => _brand.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function BrandPage() {
    const [open, setOpen] = useState(null);
    const [brandlist, setBrandlist] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionBrand, setActionBrand] = useState();
  const [edit, setEdit] = useState(false);

  const handleClickOpen = () => {
    setOpenAdd(true);
  };

  const handleClose = () => {
    setEdit(false);
    setOpenAdd(false);
  };

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const deleteConfirm = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    confirmAlert({
      title: "Are you sure to delete brand?",
      message: "The data will be lost forever.",
      buttons: [
        {
          label: "Delete",
          onClick: async () => {
            setLoading(true);
            try {
                await deleteBrand(actionBrand?.id)
                success("Brand deleted successfully")
                await getData();
            } catch (e) {
                error(e.message || "Failed to delete brand")
            }
            setLoading(false);
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = brandlist.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - brandlist.length) : 0;

  const filteredBrands = applySortFilter(brandlist, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredBrands.length && !!filterName;

  const getData = async ()=>{
    setLoading(true);
    try {
        const brands = await getBrand();
        setBrandlist(brands)
    } catch (e) {
        error(e.message || "Failed to get brands")
    }
    setLoading(false)
    }

  useEffect(() => {
    getData();
  },[])

  return (
    <>
      <Helmet>
        <title> Brand | Standard Computer International </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Brands
          </Typography>
          <Button variant="contained" onClick={handleClickOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Brand
          </Button>
        </Stack>

        <Card>
          <BrandListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <BrandListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={brandlist.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredBrands.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, created_at, updated_at } = row;
                    const selectedBrand = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedBrand}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedBrand} onChange={(event) => handleClick(event, name)} />
                        </TableCell>
                        <TableCell align="left">{id.toString()}</TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{new Date(created_at).toLocaleDateString()}</TableCell>

                        <TableCell align="left">{new Date(updated_at).toLocaleDateString() || "-"}</TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(e)=>{
                            setActionBrand({...row})
                            handleOpenMenu(e)}}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loading && (
                   <TableRow>
                     <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                       <Paper
                         sx={{
                           textAlign: 'center',
                         }}
                       >
                         <Typography variant="h6" paragraph>
                           Loading...
                         </Typography>
                       </Paper>
                     </TableCell>
                   </TableRow>
                  )}
                  {emptyRows > 0  && !loading && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                  {brandlist.length === 0 && !loading && !isNotFound && (
                   <TableRow>
                     <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                       <Paper
                         sx={{
                           textAlign: 'center',
                         }}
                       >
                         <Typography variant="h6" paragraph>
                           No Data
                         </Typography>
                         <Typography variant="body2">
                            No records found
                          </Typography>
                       </Paper>
                     </TableCell>
                   </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={brandlist.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem  onClick={()=>{handleCloseMenu();setEdit(true)}}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={deleteConfirm}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
      <Dialog open={openAdd || edit} onClose={handleClose}>
        <Formik
          initialValues={edit ? actionBrand : { name: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.name) {
              errors.name = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if(edit) {
                await updateBrand(actionBrand.id, values)
                success("Brand updated successfully")
              } else {
                await addBrand(values);
                success("Brand added successfully")
              }
                getData();

            handleClose();

            } catch (e) {
              if(edit) {
                error(e.message || "Failed to update brand")
              } else {
                error(e.message || "Failed to add brand")
              }
            }
            setSubmitting(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <form onSubmit={handleSubmit}>
              <DialogTitle>{edit ? "Edit Brand" : "Add Brand"}</DialogTitle>
              <DialogContent>
                {/* <DialogContentText>
            To subscribe to this website, please enter your name address here. We
            will send updates occasionally.
          </DialogContentText> */}
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Brand name"
                  type="text"
                  fullWidth
                  name="name"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
              {errors.name && touched.name && errors.name}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={isSubmitting} type='submit'>{edit ? "Edit" : "Add"}</Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}
