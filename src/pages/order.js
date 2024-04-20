import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Accord from 'components/accord';
import { formatCurrencyUZS } from 'utils';
import { useOutsideClick } from 'utils/hooks';
// import { departments, sendMessageTelegram } from 'utils/constants';
import { getRequest, postRequest } from 'services/api';
import { useLocaleOrders, useOrders, useProducts, useUser } from '../redux/selectors';
import { setRoomCompleted } from '../redux/localeOrders';
import OrderList from 'components/order-list';
// import axios from 'axios';

const Order = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const localeOrders = useLocaleOrders();
  const products = useProducts();
  const orders = useOrders();
  const { id } = useParams();
  const modal = useRef();
  const [loading, setLoading] = useState();
  const [isOrderMore, setIsOrderMore] = useState({ open: false });
  const [oldOrders, setOldOrders] = useState({});
  // const rooms = useRooms();
  // const thisRoom = useMemo(() => rooms?.find((rooms) => rooms.id === id), [rooms, id]);
  const thisRoomOrders = useMemo(() => localeOrders?.find((rooms) => rooms.room === id)?.recs, [localeOrders, id]);
  const sumWithInitial = thisRoomOrders?.reduce((accumulator, currentValue) => {
    return Number(accumulator) + Number(currentValue.sell_price * currentValue.count);
  }, []);

  const menus = useMemo(() => {
    const types = [...new Set(products?.map(({ category }) => category?.name))];
    return types?.map((_category_name) => {
      return {
        name: _category_name,
        menus: products?.filter(({ category }) => category?.name === _category_name)
      };
    });
  }, [products]);

  const isOrder = useMemo(() => orders?.find((order) => order?.room_id === id), [orders, id]);

  const getOldOrders = useCallback(() => {
    getRequest(`room/get/${id}`, user?.token)
      .then(({ data }) => {
        setOldOrders(data?.result);
        if (!data?.result?.products?.length) {
          setIsOrderMore({ open: false });
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.result);
      });
  }, [id, user?.token]);

  useEffect(() => {
    getOldOrders();
  }, [getOldOrders]);

  // const handleOrderComplete = (order_id) => {
  //   if (!order_id) return;
  //   setLoading(true);
  //   patchRequest(`order/report/${order_id}`, {}, user?.token)
  //     .then(({ data }) => {
  //       getRequest('order', user?.token)
  //         .then((orders) => {
  //           dispatch(setOrders(orders?.data?.result));
  //           setLoading(false);
  //           dispatch(setRoomCompleted({ room: id }));
  //         })
  //         .catch((err) => {
  //           toast.error(err?.response?.data?.result || 'Error');
  //           setLoading(false);
  //         });
  //       toast.success(data?.message || 'Success');
  //       setLoading(false);
  //       navigate('/rooms');
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       toast.success(err?.response?.data?.result || 'Error');
  //     });
  // };

  // const handleSendMessage = (array, option) => {
  //   if (!array?.length || !option?.label) return;
  //   const data = {
  //     data: {
  //       products: array?.map((product) => ({
  //         name: product?.name,
  //         quantity: product?.count
  //       }))
  //     },
  //     printer: option?.printer,
  //     waiter: user?.fullname,
  //     room: thisRoom?.name
  //   };

  //   const config = {
  //     method: 'post',
  //     maxBodyLength: Infinity,
  //     url: 'http://192.168.1.99:6001/example/interface/ethernet.php',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: data
  //   };

  //   axios
  //     .request(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   if (!array?.length || !option?.label) return;
  //   const message = `<b>Xona/Stol raqami:${thisRoom?.name}</b>\n<i>Ofitsant ismi\n${user?.fullname}</i>\n\n<b>Buyurmalar:</b>\n${array
  //     ?.map((product) => `<b>${product?.name?.toUpperCase()} (${product?.count}-${product?.unit})</b>`)
  //     .join('\n')}`;
  //   fetch(sendMessageTelegram(encodeURI(message), option?.value))
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data, 'success');
  //     })
  //     .catch((err) => {
  //       console.log(err, 'err');
  //     });
  // };

  // const departmentArray = (_department) => thisRoomOrders.filter(({ department }) => department === _department);

  const handleAddCart = () => {
    // departments.map((option) => handleSendMessage(departmentArray(option?.value), option));
    setLoading(true);
    thisRoomOrders.forEach((product, index) => {
      postRequest(
        'room/merge',
        {
          room_id: id,
          product_id: product?.id,
          quantity: product?.count,
          action: 'plus'
        },
        user?.token
      )
        .then(({ data }) => {
          setLoading(false);
          if (index === thisRoomOrders.length - 1) {
            getOldOrders();
            toast.success(data?.result);
          }
          dispatch(setRoomCompleted({ room: id }));
        })
        .catch((err) => {
          toast.error(err?.response?.data?.result || 'Error');
          setLoading(false);
        });
    });
  };

  const handleOpenDetails = () => {
    setIsOrderMore({ open: true });
  };

  // const handleCancel = (order_id) => {
  //   setLoading(true);
  //   deleteRequest(`order/${order_id}`, user?.token)
  //     .then(({ data }) => {
  //       setLoading(false);
  //       toast.info(data?.message);
  //       dispatch(setRoomCompleted({ room: id }));
  //       getRequest('order', user?.token)
  //         .then((orders) => {
  //           dispatch(setOrders(orders?.data?.result));
  //           setLoading(false);
  //           dispatch(setRoomCompleted({ room: id }));
  //         })
  //         .catch((err) => {
  //           toast.error(err?.response?.data?.result || 'Error');
  //           setLoading(false);
  //         });
  //       navigate('/rooms');
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       toast.error(err?.response?.data?.result);
  //     });
  // };

  const handleComplete = () => {
    setLoading(true);
    getRequest(`room/end/${id}`, user?.token)
      .then(({ data }) => {
        setLoading(false);
        toast.success(data?.result);
        dispatch(setRoomCompleted({ room: id }));
        getOldOrders();
        setIsOrderMore({ open: false });
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.response?.data?.result);
      });
  };

  useOutsideClick(modal, () => setIsOrderMore({ open: false }));

  return (
    <div className="container-md">
      {isOrderMore.open && (
        <div className="modal modal-prods">
          <div className="modal-body" ref={modal}>
            <div className="top">
              <div className="row-header">
                <button onClick={() => setIsOrderMore({ open: false })}>Ortga</button>
                {/* <button onClick={() => handleCancel(isOrderMore?.id)}>
                  {loading ? <div className="lds-dual-ring" /> : 'Bekor qilish'}
                </button> */}
              </div>
              <ol className="alternating-colors">
                <strong>{"Buyurtma ma'lumotlari"}</strong>
                {oldOrders?.products?.map((product) => (
                  <OrderList
                    key={product?.name}
                    product={{
                      ...product,
                      id: products?.find(({ name }) => name === product?.name)?.id
                    }}
                    loading={loading}
                    setLoading={setLoading}
                    room={id}
                    token={user?.token}
                    onUpdated={() => getOldOrders()}
                  />
                ))}
              </ol>
            </div>
            <button className="order-btn full-btn" onClick={handleComplete}>
              Buyurtmani yopish {oldOrders?.total && `${formatCurrencyUZS(oldOrders?.total)?.replace('UZS', '')} UZS`}
            </button>
          </div>
        </div>
      )}
      <div className="row-header">
        <NavLink to={'/rooms'}>
          <button>Ortga qaytish</button>
        </NavLink>
        <h1 className="full">Menu</h1>
      </div>

      {menus.map((room, key) => (
        <Accord defaultOpened={!key} key={key} room={room} id={id} thisRoomOrders={thisRoomOrders} />
      ))}
      <div className="bottom-btns">
        {oldOrders?.total ? (
          <button className="order-btn" disabled={loading} onClick={() => handleOpenDetails(isOrder?.id)}>
            {loading ? (
              <div className="lds-dual-ring" />
            ) : (
              <span>Buyurtmani yopish {oldOrders?.total && `${formatCurrencyUZS(oldOrders?.total)?.replace('UZS', '')} UZS`}</span>
            )}
          </button>
        ) : (
          ''
        )}
        {thisRoomOrders?.length ? (
          <button disabled={loading} className="order-btn" onClick={handleAddCart}>
            {loading ? (
              <div className="lds-dual-ring" />
            ) : (
              <span>Buyurtma berish {sumWithInitial && `${formatCurrencyUZS(sumWithInitial)?.replace('UZS', '')} UZS`}</span>
            )}
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default Order;
